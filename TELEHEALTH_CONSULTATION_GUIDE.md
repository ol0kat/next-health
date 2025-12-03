# Integrated Telehealth Consultation Feature

## Overview

This new feature provides a comprehensive telehealth consultation interface designed specifically for physicians who need to simultaneously manage multiple clinical tasks during a virtual patient consultation:

- **Real-time Video Call** - Video conferencing with patient
- **Live Transcript** - AI-powered speech-to-text with speaker identification
- **AI-Suggested Medical History Questions** - Context-aware questions based on the conversation
- **Dynamic Medical History Capture** - Auto-capture and manual addition of medical history items
- **Lab Results Panel** - Quick access to patient's recent lab values
- **On-the-fly Prescription Writing** - Write and send prescriptions during the call
- **Diagnosis Tracking** - Log diagnoses with ICD-10 codes

## How to Use

### Accessing the Consultation Interface

1. Navigate to `/telehealth` in your browser
2. The interface loads with a patient ready for consultation (Sarah Johnson)
3. Click **"Start Call"** to begin the telehealth session

### Key Features in Action

#### 1. **Video Call Controls**
- **Microphone Toggle**: Enable/disable your audio input
- **Video Toggle**: Enable/disable your video stream
- **Transcript Toggle**: Start/stop real-time speech recognition
- **End Call**: Terminate the consultation

#### 2. **Live Transcript Panel** (Bottom)
- Displays real-time conversation transcript
- Color-coded speaker identification:
  - **Green**: Your statements (Doctor)
  - **Blue**: Patient statements
- Shows interim (in-progress) transcription in italics
- Auto-scrolls to show latest messages

#### 3. **AI-Suggested Questions Panel** (Right Side - Default Tab)
The system analyzes the conversation and suggests follow-up questions:

- **Question Relevance**: Marked as High/Medium/Low
- **Categories**: 
  - Onset & Timeline
  - Associated Symptoms
  - Family History
  - Triggers
  - Previous Treatment
  - And more...

**Actions**:
- **"Ask" Button**: Adds the question to your Medical History for reference
- **"X" Button**: Dismisses the question
- Questions automatically marked as "Answered" when detected in transcript
- Questions marked as "Added" when you choose to ask them

#### 4. **Medical History Tab**
Captures and organizes all relevant medical information:

- **Auto-Captured**: Items extracted from transcript analysis
- **Manual**: Items you added via the Questions panel
- **Categories**: Chief Complaint, Symptoms, Family History, etc.
- Each item timestamped for reference

#### 5. **Lab Results Tab**
Quick reference to patient's latest laboratory values:

- Vital Signs (BP, HR, Temperature)
- Blood Work (Glucose, Cholesterol, etc.)
- Status indicators (Normal/Abnormal)
- "View Full Lab Report" link for detailed results

#### 6. **Prescription Writing (Rx Tab)**
Create and issue prescriptions directly during consultation:

**Fields**:
- **Diagnoses**: Add ICD-10 diagnosis codes
- **Medications**: Add medication names with dosages
- **Instructions**: Special instructions and follow-up notes

**Actions**:
- Click **"+ Add Diagnosis"** or **"+ Add Medication"** to add multiple items
- Write detailed instructions in the textarea
- Click **"Send Prescription"** to issue

## AI Features Explained

### Real-time Transcript Analysis
The system continuously analyzes the conversation to:

1. **Extract Medical Information**
   - Recognizes mentions of symptoms, conditions, and treatments
   - Automatically captures relevant medical history

2. **Generate Contextual Questions**
   - Uses conversation keywords to suggest relevant follow-up questions
   - Adapts questions based on the chief complaint
   - Prioritizes questions by clinical relevance

3. **Auto-mark Answered Questions**
   - Monitors transcript for keywords matching suggested questions
   - Marks questions as "Answered" when detected in conversation

### Example Workflow

**Patient says**: "Good morning doctor, I've been experiencing some headaches lately."

**System**:
- ✓ Captures "Chief Complaint: Headaches for past 2 weeks" in Medical History
- ✓ Suggests questions about onset, visual symptoms, family history, triggers
- ✓ Marks "When did the headaches start?" as high relevance

**Doctor clicks "Ask"** on a suggested question → It's added to Medical History for documentation

**Doctor says**: "When did this start?" 
**Patient responds**: "About two weeks ago"

**System**:
- ✓ Automatically marks "When did the headaches start?" as "Answered"

## Technical Architecture

### Components
- **IntegratedTelehealthConsultation**: Main consultation interface
- Built with React, TypeScript, and shadcn/ui components
- Uses Web Speech API for real-time transcription
- Modular tab system for easy navigation

### State Management
- React hooks for managing call state, transcript, medical history, suggestions
- Real-time updates as transcript and suggestions change

### Browser APIs Used
- **Web Speech API**: Speech-to-text transcription
- **Media Recorder API**: Audio capture and control
- **Audio Context API**: Microphone access

## Keyboard Shortcuts (Future Enhancement)

- `Spacebar`: Toggle microphone
- `V`: Toggle video
- `T`: Toggle transcript
- `Esc`: End call

## Tips for Maximum Efficiency

1. **Let the AI Help**: Review suggested questions before asking - they're ranked by relevance
2. **Dismiss Irrelevant Questions**: Remove suggestions that don't apply to this patient
3. **Reference Medical History**: Check the History tab for complete captured information
4. **Glance at Labs**: Use the Labs tab for quick vital signs reference
5. **Write Prescriptions In-Call**: Complete all prescription details before ending the call

## Known Limitations & Future Enhancements

### Current Limitations
- Requires modern browser with Web Speech API support
- Speech recognition works best in English (en-US)
- Requires explicit microphone permission from browser
- UI is optimized for desktop/tablet (not mobile)

### Planned Enhancements
- [ ] Multi-language support
- [ ] Recording and playback of consultations
- [ ] Advanced NLP for better medical entity extraction
- [ ] Integration with EHR for automatic patient data
- [ ] Automated note generation from consultation
- [ ] Prescription database integration
- [ ] Video recording with consent
- [ ] Meeting scheduler integration
- [ ] Real-time translation
- [ ] Mobile-responsive design

## Troubleshooting

### "Microphone access denied"
- Check browser permissions
- Refresh page and try again
- Ensure no other app is using the microphone

### Speech recognition not working
- Ensure microphone is enabled
- Check your internet connection
- Try a different browser (Chrome has best support)
- Refresh and restart the call

### Transcript not appearing
- Check if "Transcript" button is toggled on
- Verify microphone is working
- Clear browser cache and retry

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✓ Full | Best Web Speech API support |
| Firefox | ✓ Full | Good support |
| Safari | ✓ Full | Requires macOS 14.5+ |
| Edge | ✓ Full | Chromium-based, good support |
| Opera | ✓ Full | Chromium-based |

## API Endpoints (Backend Integration)

The following endpoints should be connected in production:

```
POST /api/consultations/start
POST /api/consultations/end
POST /api/consultations/{id}/transcript
POST /api/prescriptions/send
GET /api/patients/{id}/labs
```

## Development Notes

- Component located at: `/components/integrated-telehealth-consultation.tsx`
- Route at: `/app/telehealth/page.tsx`
- Uses TypeScript for type safety
- Follows shadcn/ui component patterns
- Fully responsive layout with flexbox

## Support & Feedback

For issues or feature requests, contact the development team.
