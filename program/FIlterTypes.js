import React from 'react';

class FilterTypes extends React.Component {
  constructor(props) {
    super(props);
    this.handleTypeChange = this.handleTypeChange.bind(this);
  }

  handleTypeChange(type) {
    this.props.onTypeChange(type);
  }

  render() {
    const {types, selectedTypes} = this.props;
  
    if(!types || types.length === 0) return <React.Fragment />

    return (
      <div className="c-program-events-filter-types">
        <ul className='c-program-events-filter-types-list'>
          <li className="c-filter-type filter-clear">
            <input 
              id="filter-types-clear" 
              type="radio" 
              name="all-types" 
              value="all"
              checked={!selectedTypes || selectedTypes.length === 0} 
              onChange={() => {
                this.handleTypeChange({slug: 'all'})
              }} 
            />
            <label htmlFor="filter-types-clear">All event types</label>
          </li>
          {types.map((type, index) => {
            const isSelected = selectedTypes.some(element => {
              return element.slug === type.slug;
            });

            return (
              <li className="c-filter-type" key={index}>
                <input 
                  id={`type-${type.slug}`}
                  type="checkbox" 
                  name="types" 
                  value={type.slug}
                  checked={isSelected}
                  onChange={(e) => {
                    let currentType = type;
                    currentType.selected = e.target.checked;
                    this.handleTypeChange(currentType)
                  }} 
                />
                <label htmlFor={`type-${type.slug}`}>{type.name}</label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default FilterTypes;