import React, { Component } from 'react';
import Toolbar from 'react-big-calendar/lib/Toolbar';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import { Button, ButtonGroup } from '@material-ui/core';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css";
const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

class FullCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [
                {
                    start: moment().toDate(),
                    end: moment()
                        .add(1, "days")
                        .toDate(),
                    title: "Some title"
                }
            ]
        }
    }
    CustomToolbarCapsule = (props) => {
        return class CustomToolbarInstance extends Toolbar {

            static defaultProps = { ...props }
            shouldComponentUpdate(nextProps) {
                if (nextProps.view !== this.props.view) {
                    this.props.Monthdata(nextProps.view)
                    return true;
                }
                return false;
            }

            render() {
                return (
                    <div>
                        <ButtonGroup className='rbc-btn-group-left' aria-label="outlined primary button group">
                            <Button type="button"
                            // onClick={() => this.navigate('TODAY')}
                            >Today</Button>
                            <Button type="button"
                            // onClick={() => this.navigate('PREV')}
                            >Back</Button>
                            <Button type="button"
                            // onClick={() => this.navigate('NEXT')}
                            >Next</Button>
                        </ButtonGroup>
                        <div className="rbc-toolbar-label-center">
                            <span className="toolbar-label">
                                {/* {this.props.label} */}
                            </span>
                            {/* {view === 'month' && resourceMap && resourceMap.length > 0 && < NativeSelect
                                value={this.props.mainResourceName}
                                onChange={(e) => this.props.changeMainResource(e)}
                            > */}
                            {/* {this.props.resourceMap.map(resource => (
                                    <option key={resource.resourceId} value={resource.resourceId}>
                                        {resource.resourceTitle}
                                    </option>
                                ))}
                            </NativeSelect>} */}
                        </div>
                        <ButtonGroup className="rbc-btn-group-right" aria-label="outlined primary button group">
                            <Button type="button"
                            // className={view === 'month' && 'rbc-active'} onClick={this.view.bind(null, 'month')}
                            >Month</Button>
                            <Button type="button"
                            // className={view === 'week' && 'rbc-active'} onClick={this.view.bind(null, 'week')}
                            >Week</Button>
                            <Button type="button"
                            // className={view === 'day' && 'rbc-active'} onClick={this.view.bind(null, 'day')}
                            >Day</Button>
                            <Button type="button"
                            // className={view === 'agenda' && 'rbc-active'} onClick={this.view.bind(null, 'agenda')}
                            >Agenda</Button>
                        </ButtonGroup>
                    </div >

                );
            }
        }
    }
    // eventStyleGetter = (event, start, end, isSelected) => {
    eventStyleGetter = () => {
        var style = {
            // backgroundColor: event.color,
            borderRadius: '0px',
            opacity: 0.8,
            color: '#ffff',
            border: '0px',
            display: 'block'
        };
        return {
            style: style
        };
    };
    hanldeSelectEvent = (event) => {
        this.props.onEventSelect(event);
    }
    render() {

        const { events } = this.props;
        return (
            <div id='divToPrint'>
                <Calendar
                    // selectable
                    localizer={localizer}
                    events={events}
                    defaultDate={new Date()}
                    defaultView="week"
                    // defaultDate={new Date()}
                    onSelectEvent={event => this.hanldeSelectEvent(event)}
                    // onSelectSlot={(e) => handleOpenMeeting(e)}
                    // resizable
                    // onEventDrop={onEventDrop}
                    // onEventResize={onEventResize}

                    // min={min}
                    // max={max}
                    views={['month', 'week', 'day']}
                    popup={true}
                    startAccessor="StartTime"
                    endAccessor="EndTime"
                    style={{ height: "100vh" }}     
                // resources={resources}
                // resourceIdAccessor="resourceId"
                // resourceTitleAccessor="resourceTitle"
                // eventPropGetter={(this.eventStyleGetter)}
                // components={{
                //     toolbar: this.CustomToolbarCapsule({ resourceMap: resources, mainResourceName, changeMainResource: changeMainResource, Monthdata: Monthdata })
                // }}


                />
                {/* {showBusinessButton && <Button variant="contained" className="showBusinessButton" onClick={handleShowTime}>{showBusiness ? 'Show 24 hours...' : 'Show business hours...'}</Button>} */}
            </div>
        );
    }
}

export default FullCalendar;