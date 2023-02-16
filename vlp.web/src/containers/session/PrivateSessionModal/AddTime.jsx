import React from 'react';
import { Button } from 'react-bootstrap';
import moment from "moment";
import TimePicker from 'rc-time-picker';
import "react-datepicker/dist/react-datepicker.css";

const AddHours = ({ list, day_index, handleRemoveClick, handleAddHours, handleChange }) => {
    let array = list;
    
    if (array) {
        return ( 
            <div>
                { array.map((x, i) => {
                    let StartTime = moment(new Date(`1999-09-09 ${x['Start']}`.replace(/-/g,"/")));
                    let EndTime = moment(new Date(`1999-09-09 ${x['End']}`.replace(/-/g,"/")));
                    console.log(StartTime); 
                    return (
                        <div className="timeSlot" key={i}>
                            <TimePicker
                                showSecond={false}
                                onChange={(e) => handleChange(e, i, day_index, 'Start')}
                                hideDisabledOptions
                                minuteStep={30}
                                value={StartTime}
                                // disabledHours={() => hours}
                                use12Hours
                                style={{ width: '30%', marginRight: '10px', }}
                            />
                            <TimePicker
                                showSecond={false}
                                onChange={(e) => handleChange(e, i, day_index, 'End')}
                                hideDisabledOptions
                                minuteStep={30}
                                value={EndTime}
                                use12Hours
                                style={{ width: '30%', marginRight: '10px' }}
                            />
                            {array.length !== 1 ? <i class="fa fa-times" aria-hidden="true" onClick={() => handleRemoveClick(i, day_index)} /> : ''}

                            {array.length - 1 === i &&

                                <Button variant="link" onClick={(e) => { handleAddHours(day_index) }}>Add Hours</Button>}
                        </div>
                    )
                })}
            </div>)
    }
    else {
        return <></>
    }
}
export default AddHours;