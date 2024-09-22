import React, { useState } from 'react';
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";

const WeeklyCalendar = () => {
    const config = {
        viewType: "Week"
    };

    return (
        <div>
            <DayPilotCalendar {...config} />
        </div>
    );
}

export default WeeklyCalendar;