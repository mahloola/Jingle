import { useState } from 'react';
import { sendFeedback } from '../../data/jingle-api';
import '../../style/modal.css';
import Modal from '../Modal';
import { Button } from '../ui-util/Button';

export default function ReportModalButton() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const closeModal = () => {
    setOpen(false);
  };
  const handleFeedbackInput = (input: string) => {
    setFeedback(input);
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      await sendFeedback(feedback);
      setLoading(false);
      setOpen(false);
    } catch (err) {
      console.error('Could not submit feedback: ', err);
    }
  };

  return (
    <>
      {' '}
      <Button
        label='Feedback'
        onClick={() => setOpen(true)}
        classes='report-btn'
      />
      {/* <Chip
        size='small'
        label={`Report Bug`}
        color='error'
        className='report-btn'
        onClick={() => setOpen(true)}
      /> */}
      <Modal
        open={open}
        saveDisabled={loading || !feedback.length}
        onClose={closeModal}
        primaryButtonText='Submit'
        onApplySettings={onSubmit}
      >
        <h1>Feedback</h1>
        {!loading ? (
          <>
            <p>Send us anything, anything at all.</p>
            <textarea
              value={feedback}
              onChange={(e) => handleFeedbackInput(e.target.value)}
              placeholder={'Type your message here...'}
              style={{
                width: '90%',
                padding: '10px',
                height: '200px',
                marginBottom: '10px',
                background: 'rgba(160, 160, 160, 1)',
                resize: 'vertical', // Optional: allows vertical resizing
                fontFamily: 'inherit', // Uses parent font
                fontSize: 'inherit', // Uses parent font size
                lineHeight: 'normal', // Prevents text centering
                whiteSpace: 'pre-wrap', // Allows text to wrap
                wordWrap: 'break-word', // Breaks long words
              }}
            />
          </>
        ) : (
          <p>Sending feedback...</p>
        )}
      </Modal>
    </>
  );
}
