
import { Modal, Button, Tabs, Tab, Dropdown  } from 'react-bootstrap';
import React, { useState } from 'react';
import { useQuery,  useQueryClient, useMutation } from '@tanstack/react-query';

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

const UpdateScheduleModal = ({ showModal, handleClose, tutoringSessionData = [], tutors = [], sessionId = null, assessmentId = null }) => {
    const defaultTutorId = useMemo(() => {
        const session = tutoringSessionData.find(tutoring_session => String(tutoring_session.session_id) === String(sessionId));
        return session?.tutor_id || null;
      }, [sessionId, tutoringSessionData]);

    const [selectedTutor, setSelectedTutor] = useState(defaultTutorId);
    const queryClient = useQueryClient();

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

    if(sessionId)
    {
        const hasTutorChanged = selectedTutor !== defaultTutorId;

        return (
            <Modal show={showModal} onHide={handleClose} centered>
              <Modal.Header closeButton>
                <Modal.Title>Change Session Detail</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p
                  style={{
                    backgroundColor: hasTutorChanged ? '#d4edda' : 'transparent',
                    padding: '5px',
                    fontWeight: hasTutorChanged ? 'bold' : 'normal'
                  }}
                >
                  Change Tutor?
                </p>
                
                <select
                  className="form-select"
                  onChange={(e) => setSelectedTutor(e.target.value)}
                  value={selectedTutor}
                  style={{
                    backgroundColor: hasTutorChanged ? '#d4edda' : 'transparent'
                  }}
                >
                  <option value="">Select a tutor</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.tutor_id} value={tutor.tutor_id}>
                      {tutor.first_name} {tutor.last_name}
                    </option>
                  ))}
                </select>
        
                {hasTutorChanged && (
                  <p style={{ color: '#155724', textAlign: 'right', marginTop: '5px', fontSize: '0.9em' }}>
                    changed
                  </p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={applySessionChange}>Apply</Button>
              </Modal.Footer>
            </Modal>
        );
    };

    //else
    return(
        <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header closeButton>
            <Modal.Title>Select Tutor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Which tutor should I send this to?</p>
                <select className="form-select" onChange={(e) => setSelectedTutor(e.target.value)}>
                    <option>Select a tutor</option>
                    {tutors.map((tutor) => (
                    <option key={tutor.tutor_id} value={tutor.tutor_id}>{tutor.first_name} {tutor.last_name}</option>
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