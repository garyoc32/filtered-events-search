import React from 'react';
import {createRoot} from 'react-dom/client';
import {format, compareAsc, parse} from 'date-fns';
import {Collapse} from 'react-collapse';
import FilterDates from './program/FilterDates';
import FilterAreas from './program/FilterAreas';
import FilterTypes from './program/FIlterTypes';
import EventList from './program/EventList';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: this.props.events,
      eventTypes: this.props.eventTypes,
      eventDates: this.props.eventDates,
      eventAreas: this.props.eventAreas,
      filteredEvents: [],
      selectedDate: '',
      selectedArea: {slug: 'all'},
      selectedTypes: [],
      typeFiltersExpanded: false,
      areaFiltersExpanded: false,
    };
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleAreaChange = this.handleAreaChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleToggleClick = this.handleToggleClick.bind(this);
  }

  // Function to recognise if today is an event day and automatically filter to today
  componentDidMount() {
    const today = format(Date.now(), 'yyyy-MM-dd');
    let selectedDate = this.state.eventDates[0];
    
    const isToday = date => {
      return date === today;
    }

    if(this.state.eventDates.some(isToday)) {
      selectedDate = today;
    }

    this.setState({selectedDate: selectedDate},
      () => {this.filterEvents()}
    );

    this.handleParams();
  }

  /**
   * Handle any url parameters
   * Create this function so the client could create direct links to for example, Kids events on Saturday
   */
   handleParams() {
    const searchParams = new URLSearchParams(document.location.search);

    let paramEventTypes = [];

    if (searchParams.get('category')) {
      const myEventTypes = searchParams.get('category').split(',');

      for (const categoryString of myEventTypes) {
        const foundCategory = this.getCategory(categoryString);

        if (foundCategory) {
          foundCategory.selected = true;
          paramEventTypes.push(foundCategory);
        }
      }
    }

    let paramArea = this.getArea(searchParams.get('area')) || this.state.selectedArea;
    let paramDate = searchParams.get('date') || this.state.eventDates[0];

    if (paramEventTypes.length > 0 || paramArea) {
      let updatedSelectedTypes = paramEventTypes.length > 0 ? paramEventTypes : [];
      let updatedSelectedDate = paramDate;
      let updatedSelectedArea = paramArea;

      this.setState({
        selectedTypes: updatedSelectedTypes,
        selectedDate: updatedSelectedDate,
        selectedArea: updatedSelectedArea,
      },
        () => { this.filterEvents() }
      );
    }
  }

  parseDateString(dateString) {
    if(!dateString) return false;

    return parse(dateString, 'yyyy-MM-dd kk:mm:ss', new Date());
  }

  /**
   * Handler for Filter Collapse toggle
   */
  handleToggleClick(toggle) {
    if(toggle == 'typeFilter') {
      this.setState(prevState => ({
        typeFiltersExpanded: !prevState.typeFiltersExpanded,
      }));
    }
    if(toggle == 'areaFilter') {
      this.setState(prevState => ({
        areaFiltersExpanded: !prevState.areaFiltersExpanded,
      }));
    }
  }

  /**
   * Get Category from Slug
   */
   getCategory(category) {
    let categories = this.state.eventTypes;
    console.log(categories);
    var result = categories.find(item => item.slug === category);
    return result;
  }

  /**
   * Get Location from Slug
   */
   getArea(area) {
    let areas = this.state.eventAreas;
    var result = areas.find(item => item.slug === area);
    return result;
  }

  /**
   * Rebuild Events list by creating a new event for every schedule session.
   * Returns now Event list. 
   */
  expandEventList(events) {
    const eventList = [...events];
    let rebuiltEventList = [];

    if(eventList && eventList.length) {
      eventList.forEach(event => {
        if(event.schedule.length > 1) {
          const todaysSessions = [];

          event.schedule.forEach(session => {
            const parsedDate = this.parseDateString(session.start);

            if(session.start && parsedDate && (format(parsedDate, 'yyyy-MM-dd') === this.state.selectedDate)) {
              todaysSessions.push({...session});
            }
          });

          if(todaysSessions.length) {
            todaysSessions.forEach(tSession => {
              let newEvent = {...event};

              newEvent.schedule = [{...tSession}];

              rebuiltEventList.push(newEvent);
            });
          }
        } else {
          rebuiltEventList.push(event);
        }
      });
    }

    return rebuiltEventList;
  }

  /**
   * Trigger update to GTM dataLayer with program filtering data.
   */
  updateDataLayer(data, filter = 'date') {
    window.dataLayer = window.dataLayer || [];

    if(data) {
      let value = filter === 'area' ? data.slug : data;

      if(filter === 'type') {
        if(data.length) {
          value = data.map(i => {
            return i.slug;
          });
        } else {
          value = 'all';
        }
      }

      window.dataLayer.push({
        'event': 'program_filtering',
        'program_filtering_type': `event_${filter}`,
        'program_filtering_value': value,
      });
    }
  }

  /**
   * Filter Date Handler.
   */
  handleDateChange(date) {
    this.setState({selectedDate: date},
      () => {this.filterEvents()}
    );
    this.updateDataLayer(date);
  }
  
  /**
   * Filter Area Handler.
   */
  handleAreaChange(area) {
    this.setState({selectedArea: area},
      () => {this.filterEvents()}
    );
    this.updateDataLayer(area, 'area');
  }

  /**
   * Filter Type Handler.
   */
  handleTypeChange(type) {
    let updatedSelectedTypes = [...this.state.selectedTypes];

    if(type.slug === 'all') {
      updatedSelectedTypes = [];
    } else {
      const typeIsSelected = type.selected;
  
      if(typeIsSelected) {
        updatedSelectedTypes.push(type);
  
      } else {
        updatedSelectedTypes = updatedSelectedTypes.filter(t => {
          return t.slug !== type.slug;
        });
      }
    }

    this.setState({selectedTypes: updatedSelectedTypes},
      () => {this.filterEvents()}
    );
    this.updateDataLayer(updatedSelectedTypes, 'type');
  }

  /**
   * Sorts events by start time ASC.
   */
  sortEvents = (eventA, eventB) => {
    if((eventA.schedule && eventA.schedule.length) && (eventB.schedule && eventB.schedule.length)) {
      const eventAStart = eventA.schedule[0].start;
      const eventBStart = eventB.schedule[0].start;

      if(eventAStart && eventBStart) {
        return compareAsc(this.parseDateString(eventAStart), this.parseDateString(eventBStart));
        // return compareAsc(new Date(eventAStart), new Date(eventBStart));
      }
    }

    return 0;
  }

  /**
   * Runs events through each filter.
   */
  filterEvents() {
    const events = [...this.state.events];

    let updatedEventList = this.filterEventsByDate(events);

    updatedEventList = this.filterEventsByArea(updatedEventList);

    updatedEventList = this.filterEventsByType(updatedEventList);

    let expandedEventList = this.expandEventList(updatedEventList);

    this.setState({filteredEvents: expandedEventList.sort(this.sortEvents)});
  }

  /**
   * Filters events by selected date.
   */
  filterEventsByDate(events) {
    let filteredEvents = [...events];

    const isTodayEvent = event => {
      if(event.schedule && event.schedule.length) {
        return event.schedule.some(session => {
          if(!session.start) return false;
          const parsedString = this.parseDateString(session.start); //parse(session.start, 'yyyy-MM-dd kk:mm:ss', new Date());

          const start = format(parsedString, 'yyyy-MM-dd');
          return start === this.state.selectedDate;
        });
      }

      return false;
    }

    return filteredEvents.filter(isTodayEvent);
  }

  /**
   * Filters events by selected area.
   */
  filterEventsByArea(events) {
    let filteredEvents = [...events];
    const selectedArea = this.state.selectedArea;

    const isInArea = event => {
      if(event.areas && event.areas.length) {
        return event.areas.some(area => {
          return area.slug === selectedArea.slug;
        });
      }

      return false;
    }

    if(selectedArea.slug !== 'all') {
      return filteredEvents.filter(isInArea);
    } else {
      return filteredEvents;
    }
  }

  /**
   * Filters events by selected type.
   */
  filterEventsByType(events) {
    let filterEvents = [...events];
    const selectedTypes = this.state.selectedTypes;

    const hasEventType = event => {
      if(event.types && event.types.length) {
        return event.types.some(type => {
          return selectedTypes.some(selType => {
            return selType.slug === type.slug;
          });
        });
      }

      return false;
    }

    if(selectedTypes && selectedTypes.length) {
      return filterEvents.filter(hasEventType);
    } else {
      return filterEvents;
    }
  }

  render() {

    return (
      <div className="c-program-events-container">
        <div className="wrapper-content">
          <FilterDates 
            dates={this.state.eventDates} 
            selectedDate={this.state.selectedDate} 
            onDateChange={this.handleDateChange} 
          />
          <div className="c-program-events-filter-display">
            <div className="c-program-events-filter-display-left">
              <button
                className="c-program-events-filter-toggle"
                onClick={() => this.handleToggleClick('areaFilter')}
              >
                <span>Filter By Area</span>
                <span className={`filter-toggle-icon ${this.state.areaFiltersExpanded ? 'open' : 'closed'}`}></span>
              </button>
              <Collapse isOpened={this.state.areaFiltersExpanded}>
                <FilterAreas 
                  areas={this.state.eventAreas} 
                  selectedArea={this.state.selectedArea} 
                  onAreaChange={this.handleAreaChange} 
                />
              </Collapse>
            </div>
            <div className="c-program-events-filter-display-left">
              <button
                className="c-program-events-filter-toggle"
                onClick={() => this.handleToggleClick('typeFilter')}
              >
                <span>Filter By Event Type</span>
                <span className={`filter-toggle-icon ${this.state.typeFiltersExpanded ? 'open' : 'closed'}`}></span>
              </button>
              <Collapse isOpened={this.state.typeFiltersExpanded}>
                <FilterTypes 
                  types={this.state.eventTypes} 
                  onTypeChange={this.handleTypeChange} 
                  selectedTypes={this.state.selectedTypes}
                  />
              </Collapse>
            </div>
          </div>
        </div>
        <EventList events={this.state.filteredEvents} />
      </div>
    );
  }
}

const domContainer = document.querySelector('#program');
const root = createRoot(domContainer);
const jsonData = domContainer.dataset.program;
let props = {};

if(domContainer && typeof jsonData !== 'undefined') {
  props = {...JSON.parse(jsonData)};

  root.render(<App {...props} />);
}
