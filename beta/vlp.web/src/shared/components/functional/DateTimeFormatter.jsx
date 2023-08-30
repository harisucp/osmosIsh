import React from 'react';
import Moment from 'react-moment';
import moment from 'moment';

const FormatDateTime = ({ date, format }) => {
    if (!date)
        return '';

    const dateToFormat = moment.utc(date).local();
    return (
        <Moment date={dateToFormat} format={format} />
    )
}

export default FormatDateTime;