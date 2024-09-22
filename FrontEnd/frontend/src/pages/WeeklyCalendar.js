import React, { useState } from 'react';
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";

const WeeklyCalendar = () => {
    const config = {
        viewType: "Week"
    };

    return (
      <div className="App">
        <h2>Welcome, User!</h2>
        <div>
            <DayPilotCalendar {...config} />
        </div>
      </div>
    );
}

export default WeeklyCalendar;  