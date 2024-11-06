
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
    const [selectedTutor, setSelectedTutor] = useState(null);
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