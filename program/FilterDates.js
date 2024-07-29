import React from 'react';
import format from 'date-fns/format';

class FilterDates extends React.Component {
  constructor(props) {
    super(props);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  handleDateChange(date) {
    this.props.onDateChange(date);
  }
  
  render() {
    const {dates, selectedDate} = this.props;

    if(!dates || dates.length === 0) return <React.Fragment />

    return (
      <div className="c-program-events-filter-dates">
        <ul className='c-program-events-filter-dates-list'>
          {dates.map((date, index) => {
            const theDate = new Date(date);

            let displayDay = format(theDate, 'EEEE');
            let displayDateMonth = format(theDate, 'd MMMM');

            if(window.matchMedia('(max-width: 1080px)').matches) {
              displayDay = format(theDate, 'EEE');
              displayDateMonth = format(theDate, 'd MMM'); 
            }

            return (
              <li className="c-filter-date" key={index}>
                <div className="c-filter-date-btn">
                  <input 
                    id={date} 
                    type="radio" 
                    name="dates" 
                    value={date} 
                    checked={selectedDate === date} 
                    onChange={() => this.handleDateChange(date)} 
                  />
                  <label htmlFor={date}><span>{displayDay}</span><span>{displayDateMonth}</span></label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    )
  }
}

export default FilterDates;