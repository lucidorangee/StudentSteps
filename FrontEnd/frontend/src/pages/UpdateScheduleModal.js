
import { Modal, Button, Tabs, Tab, Dropdown  } from 'react-bootstrap';
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';

const patchTutoringSession = async (id, changeData) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tutoringsessions/${id}`, {
      credentials: 'include',
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(changeData),
    });
  
    if (!response.ok) {
      const responseText = await response.text();
      throw new Error('Failed to update tutoring session: ' + responseText);
    }
  
    return id;
};

const UpdateScheduleModal = ({ showModal, handleClose, tutoringSessionData = [], tutors = [], sessionId = null }) => {
    const defaultTutorId = useMemo(() => {
        const session = tutoringSessionData.find(tutoring_session => String(tutoring_session.session_id) === String(sessionId));
        return session?.tutor_id || null;
    }, [sessionId, tutoringSessionData]);

    const defaultDateTime = useMemo(() => {
        const session = tutoringSessionData.find(tutoring_session => String(tutoring_session.session_id) === String(sessionId));
        return session?.session_datetime ? new Date(session.session_datetime) : null;
    }, [sessionId, tutoringSessionData]);

    const [selectedDateTime, setSelectedDateTime] = useState(defaultDateTime);
    const [selectedTutor, setSelectedTutor] = useState(defaultTutorId);
    const queryClient = useQueryClient();

    useEffect(() => {
        setSelectedTutor(defaultTutorId);
    }, [defaultTutorId]);

    useEffect(() => {
        if (defaultDateTime) {
            setSelectedDateTime(defaultDateTime);
        }
    }, [defaultDateTime]);

    const { mutate: updateTutoringSession, isLoading, isError, error } = useMutation({
        mutationFn: ({ id, changeData }) => patchTutoringSession(id, changeData),
        onSuccess: () => {
            console.log("Successfully updated");
            queryClient.invalidateQueries(['tutoringSessions']);
        },
        onError: (error) => {
            console.log('Error updating the tutoring session:', error.message);
        }
    });

    const applySessionChange = () => {
        const selectedSession = tutoringSessionData.find(tutoring_session => String(tutoring_session.session_id) === String(sessionId));

        updateTutoringSession({ id: selectedSession.session_id, changeData: { tutor_id: Number(selectedTutor) } });
        handleClose();
    };

    const hasTutorChanged = selectedTutor !== defaultTutorId;
    const hasDateTimeChanged = selectedDateTime?.getTime() !== defaultDateTime?.getTime();
    console.log(`selectedDateTime ${typeof selectedDateTime} ${selectedDateTime} defaultDateTime ${typeof defaultDateTime} ${defaultDateTime}`);

    if (sessionId) {

        return (
            <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Change Session Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div
                    style={{
                        backgroundColor: hasTutorChanged ? '#d4edda' : 'transparent',
                        padding: '5px',
                        fontWeight: hasTutorChanged ? 'bold' : 'normal',
                        borderRadius: '5px' // Optional: to smooth the edges
                    }}
                >
                    <p style={{ marginBottom: '8px' }}>Change Tutor?</p>
                    <select
                        className="form-select"
                        onChange={(e) => setSelectedTutor(Number(e.target.value))}
                        value={selectedTutor}
                        style={{
                            backgroundColor: hasTutorChanged ? '#d4edda' : 'transparent'
                        }}
                    >
                        <option value="-1">None</option>
                        {tutors.map((tutor) => (
                            <option key={tutor.tutor_id} value={tutor.tutor_id}>
                                {tutor.first_name} {tutor.last_name}
                            </option>
                        ))}
                    </select>
                </div>
                <p style={{ color: `#155724`, textAlign: 'right', marginTop: '5px', fontSize: '0.9em', minHeight: '1em' }}>
                    {hasTutorChanged ? "changed" : ""}
                </p>

                {/* Change Time */}
                <div
                    style={{
                        backgroundColor: hasDateTimeChanged ? '#d4edda' : 'transparent',
                        padding: '5px',
                        borderRadius: '5px' 
                    }}
                >
                    <p style={{ marginBottom: '8px', fontWeight: hasDateTimeChanged ? 'bold' : 'normal', }}>Change Date&Time?</p>
                    <DatePicker
                      selected={selectedDateTime}
                      onChange={(date) => setSelectedDateTime(date)}
                      showTimeSelect
                      timeFormat="h:mm aa"
                      timeIntervals={30}
                      dateFormat="yyyy/MM/dd h:mm aa"
                      className="form-control"
                      placeholderText="Select date and time"
                    />
                    <FaCalendarAlt className="text-secondary" style={{ marginLeft: '8px' }} />
                </div>
                <p style={{ color: `#155724`, textAlign: 'right', marginTop: '5px', fontSize: '0.9em', minHeight: '1em' }}>
                    {hasDateTimeChanged ? "changed" : ""}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={applySessionChange}>Apply</Button>
            </Modal.Footer>
        </Modal>

        );
    }

    return (
        <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Select Tutor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Which tutor should I send this to?</p>
                <select className="form-select" onChange={(e) => setSelectedTutor(e.target.value)}>
                    <option>Select a tutor</option>
                    {tutors.map((tutor) => (
                        <option key={tutor.tutor_id} value={tutor.tutor_id}>
                            {tutor.first_name} {tutor.last_name}
                        </option>
                    ))}
                </select>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={applySessionChange}>Apply</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UpdateScheduleModal;
