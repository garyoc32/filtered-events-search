import React from 'react';

class FilterAreas extends React.Component {
  constructor(props) {
    super(props);
    this.handleAreaChange = this.handleAreaChange.bind(this);
  }

  handleAreaChange(area) {
    this.props.onAreaChange(area);
  }
  
  render() {
    const {areas, selectedArea} = this.props;
  
    if(!areas || areas.length === 0) return <React.Fragment />

    return (
      <div className="c-program-events-filter-areas">
        <ul className='c-program-events-filter-areas-list'>
          <li className="c-filter-area clear-filter">
            <input 
              id="filter-areas-clear" 
              type="radio" 
              name="areas" 
              value="all" 
              checked={selectedArea.slug === 'all'}
              onChange={() => this.handleAreaChange({slug: 'all'})} 
            />
            <label htmlFor="filter-areas-clear">All areas</label>
          </li>
          {areas.map((area, index) => {
            return (
              <li className="c-filter-area" key={index}>
                <input 
                  id={`area-${area.slug}`}
                  type="radio" 
                  name="areas" 
                  value={area.slug}
                  checked={selectedArea.slug === area.slug}
                  onChange={() => this.handleAreaChange(area)} 
                />
                <label htmlFor={`area-${area.slug}`}>{area.name}</label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default FilterAreas;