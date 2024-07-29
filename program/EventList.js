import React from 'react';
import {format, parse} from 'date-fns';

function Event(props) {
  const {title, desc, schedule, location} = props;
  const session = schedule && schedule.length ? schedule[0] : null;
  const colour = location && location.length ? location[0].colour : '';
  const locationName = location && location.length ? location[0].name : '';
  let start, end;
  
  const parseDateString = dateString => {
    if(!dateString) return false;

    return parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
  }

  // Format dates for display
  if(session && session.start && session.end) {
    start = format(parseDateString(session.start), 'h.mmaaa').replace('.00', '');
    end = format(parseDateString(session.end), 'h.mmaaa').replace('.00', '');
  }

  return (
    <article className="c-program-event">
      <div className="c-program-event-meta">
        <div className="c-program-event-dates">
          <div className="c-program-event-start">
            <span className="date-title">FROM</span>
            <span className="date-time">{start}</span>
          </div>
          <div className="c-program-event-end">
            <span className="date-title">TO</span>
            <span className="date-time">{end}</span>
          </div>
        </div>
      </div>
      <div className="c-program-event-content">
        {title && <h3>{title}</h3>}
        {desc && <div dangerouslySetInnerHTML={{__html: desc}} />}
      </div>
      <div className="c-program-event-location" style={{backgroundColor: '#' + colour}}><span>{locationName}</span></div>
    </article>
  );
}

function EventList(props) {
  const {events} = props;
  const hasEvents = events.length > 0 ? true : false;

  return (
    <div className="c-program-events-grid">
      <ul className="c-program-events-list">
        {hasEvents && events.map((event, index) => {
          return (
            <li key={index}><Event {...event} /></li>
          );
        })}

        {!hasEvents && (
          <li>
            <article className="c-program-event no-events">
              <h3>Unfortunately there are no events matching your preferences, continue filtering for other exciting events</h3>
            </article>
          </li>
        )}
      </ul>
    </div>
  );
}

export default EventList;