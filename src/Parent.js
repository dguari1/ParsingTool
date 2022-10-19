import { useState, createRef, useEffect } from "react";
// import VideoSegmentation from "./VideoSegmentation";
import VideoAudioParsing from "./VideoAudioParsing";
// import AudioParsing from "./AudioParsing";



function Parent() {

  const [data, setData] = useState('');
  const [showAudioVideo_New, setShowAudioVideo_New] = useState(false);
  const [showAudioVideo_Load, setShowAudioVideo_Load] = useState(false);
  const [showAudio_New, setShowAudio_New] = useState(false);
  const [showAudio_Load, setShowAudio_Load] = useState(false);

  function handleClick(event) {
    console.log(event.target.value)
    switch (event.target.value) {
      case 'AudioVideo_New':
        console.log('AudioVideo_New')
        setShowAudioVideo_New(true);
        setShowAudioVideo_Load(false);
        setShowAudio_New(false);
        setShowAudio_Load(false);
        break;
      case 'AudioVideo_Load':
        setShowAudioVideo_New(false);
        setShowAudioVideo_Load(true);
        setShowAudio_New(false);
        setShowAudio_Load(false);
        break;
        case 'Audio_New':
            setShowAudioVideo_New(false);
            setShowAudioVideo_Load(false);
            setShowAudio_New(true);
            setShowAudio_Load(false);
            break;
        case 'Audio_Load':
            setShowAudioVideo_New(false);
            setShowAudioVideo_Load(false);
            setShowAudio_New(false);
            setShowAudio_Load(true);
            break;
      default:
        break;
    }

  }

  const childCallback = (data) => {
    if (data) {
      setData(data)
      console.log(data)
      
        // if (data.blob)  {
        // setButtonSaveDisabled(false);
        // }
 
    } // end if (data)
  }

  return (
    // <WebCamStream childToParentCallback={childCallback}/>
    // <WebCamRecord />
    <div>
    <center> 
    <button onClick={handleClick} value="AudioVideo_New" >BBP - NEW</button>
    <button onClick={handleClick} value="AudioVideo_Load" >BBP load</button>
    <button onClick={handleClick} value="Audio_New" >OPEN</button>
    <button onClick={handleClick} value="Audio_Load" >DDK</button>
    </center>

    { showAudioVideo_New? <VideoAudioParsing childToParentCallback={childCallback} 
                                                src={'/test_video/video_BBP.webm'}/> : null }
    { showAudioVideo_Load? <VideoAudioParsing childToParentCallback={childCallback} 
                                         src={'/test_video/video_BBP.webm'}
                                         parse_file = {'/test_video/video_BBP-parse.json'}
                                         /> : null }

    { showAudio_New? <VideoAudioParsing childToParentCallback={childCallback} 
                                         src={'/test_video/T008_1039_1_20220906_T008_1039_1_20220906_1037.webm'}
                                         parse_file = {'/test_video/T008_1039_1_20220906_T008_1039_1_20220906_1037-parse.json'}
                                         peaks_data = {'/test_video/T008_1039_1_20220906_T008_1039_1_20220906_1037-peaks_new.json'}
                                         /> : null }
    { showAudio_Load? <VideoAudioParsing childToParentCallback={childCallback} 
                                         src={'/test_video/audio_BAMBOO.wav'} 
                                         parse_file = {'/test_video/audio_BAMBOO-parse.json'}
                                         /> : null }

    
  </div>
  )
    
}

export default Parent;
