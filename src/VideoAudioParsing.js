// import { toHaveDescription, toHaveStyle } from "@testing-library/jest-dom/dist/matchers";
import { Component, createRef, useState, useEffect, useMemo, useCallback } from "react";
import { average} from "./utils";
import  "./VideoSegmentation.css";

// import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline';
// import CursorPlugin from "wavesurfer.js/src/plugin/cursor";
// import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';

import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";
import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js";
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import MiniMapPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.minimap.min.js';
// import CustomWavesurfer from "./CustomWaveSurfer";

var WaveSurfer = require("wavesurfer.js");

class VideoAudioParsing extends Component {
    constructor(props) {
        super(props);
        // variables carried by the state and updated via this.setState()
        this.state = {
            buttonDisabled : true,
            rows : [],
            videoWidth : '50%',
            startTimerRegionKeyboard : null,
            file_name : null
        }


        this.waveFormRef = createRef();
        this.wavesurfer = createRef();
        this.timelineRef = createRef(); //create a reference to the timeline
        this.minimapRef = createRef(); //create a reference to the minimap
        // this.audioRef = createRef();

        // this.canvaForWaveColorRef = createRef(null);    //create a reference to the canvas for wave color

        this.videoRef = createRef();
        // this.canvasRef = createRef();
        this.previousFrame = createRef();
        this.previousFrame_5 = createRef();
        this.playVideo = createRef();
        this.nextFrame = createRef();
        this.nextFrame_5 = createRef();
        this.startTime = createRef();
        this.endTime = createRef();
        this.repName = createRef();
        this.save = createRef();
        this.sliderRef = createRef();

        this.draggedRow = null;



        this.duration = null; // variable that holds the end time of the recording
        this.previousTime = -1; 
        this.frameCounter = 0; 
        this.arrayFrameRate = [ ]; // array that holds the frame rate estimates
        this.estimatedFrameRate = 0; // variable that holds the estimated frame rate

        this.regionToChange = null // variable that indicates what region is going to be modified 

        this.inputFile = createRef(); // this is a reference to the input file
        this.loadButtonTag = createRef();
        // this.loadingAnimation = createRef();
        this.zoomSelect = createRef();

    }

    componentDidMount = () => {

        // load the video here
        this.estimatedFrameRate = 0;
        document.addEventListener('keydown', this.handleKeyPress);

        // add a listener that will be called on window resize
        window.addEventListener('resize', this.handleResize)

        // var linGrad = this.canvaForWaveColorRef.current.getContext('2d').createLinearGradient(0, 0, 1000, 128);
        // linGrad.addColorStop(0.5, '#8ED6FF'); 
        // linGrad.addColorStop(0.5, '#004CB3');

        // create the wavesurfer element
        this.wavesurfer.current =  WaveSurfer.create({
            barWidth: this.props.peaks_data? null : 1,
            //cursorWidth: 1,
            container: this.waveFormRef.current,
            backend: "MediaElement",
            height: 100,
            progressColor: "#4a74a5",//'transparent',//"#4a74a5", //initially transparent to hide the fps estimation
            responsive: true,
            mergeTracks: true,
            //splitChannels: true,
            waveColor:  "#ccc",
            cursorColor: "#4a74a5",//'transparent',//"#4a74a5", //initially transparent to hide the fps estimation
            normalize: true,
            scrollParent: true,
            zoom : true,
            plugins: [
              RegionsPlugin.create({
                regions: this.state.rows, //this.regions,
                dragSelection: {
                  slop: 5
                },
                color: "rgba(197, 180, 227, .25)",
                loop: true,
              }),
                TimelinePlugin.create({
                    wavesurfer: this.wavesurfer.current,
                    container: this.timelineRef.current,
                    height: 20,
                    notchWidth: 1,
                    notchMargin: 0.5,
                    notchOffset: 0.5,   
                    timeInterval: 5,
                }),
                CursorPlugin.create({
                    showTime: true,
                    showTimePosition: true,
                    showCursor: true,
                    opacity: 1,
                }),
                MiniMapPlugin.create({ 
                    wavesurfer: this.wavesurfer.current,
                    container: this.minimapRef.current,
                    waveColor: '#777',
                    progressColor: '#222',
                    height: 20
                }),

            ]
          });
 
        // on error
        this.wavesurfer.current.on('error', function(e) {
            console.warn(e);
        });

        this.wavesurfer.current.on('region-update-end', this.handleRegionCreated);
        //display id of region removed
        this.wavesurfer.current.on('region-remove', this.handleRegionRemoved);

  
        // fetch(this.props.peaks_data) //read the file
        // .then(response => {
        //     if(response.ok) return response.json();
        //     else throw new Error("Not 2xx response", {cause: response});
        //     })
        // .then(data => {
        //     // read peaks data
        //     this.wavesurfer.current.load(this.videoRef.current,data.peaks);
        //     //this.wavesurfer.current.backend.setPeaks(data.peaks);

        //     //modify wavesurfer drawWave function to draw only half of the wave
        //     //idea taken and modified from here: https://jsfiddle.net/JonKnight/xpvt214o/982381/
        //     this.wavesurfer.current.drawer.drawWave = (peaks, channelIndex, start, end) =>  {
        //         return this.wavesurfer.current.drawer.prepareDraw(
        //             peaks,
        //             channelIndex,
        //             start,
        //             end,
        //             ({ absmax, hasMinVals, height, offsetY, halfH, peaks, channelIndex }) => {
        //                 if (!hasMinVals) {
        //                     const reflectedPeaks = [];
        //                     const len = peaks.length;
        //                     let i = 0;
        //                     for (i; i < len; i++) {
        //                         reflectedPeaks[2 * i] = peaks[i];
        //                         reflectedPeaks[2 * i + 1] = 0
        //                     }
        //                     peaks = reflectedPeaks;
        //                 }
        
        //                 // if drawWave was called within ws.empty we don't pass a start and
        //                 // end and simply want a flat line
        //                 if (start !== undefined) {
        //                     this.wavesurfer.current.drawer.drawLine(peaks, absmax, halfH=this.wavesurfer.current.params.height, offsetY, start, end, channelIndex);
        //                 }
        
        //                 // always draw a median line
        //                 this.wavesurfer.current.drawer.fillRect(
        //                     0,
        //                     halfH + offsetY - this.halfPixel,
        //                     this.width,
        //                     this.halfPixel,
        //                     this.barRadius,
        //                     channelIndex
        //                 );
        //             }
        //         );
        //     }
                    
        // }
        // ).catch(e => {
        //     console.error('error loading peak file', e);
        //     // load the media file -- peak data not available
        //     this.wavesurfer.current.load(this.videoRef.current);
        //     });
      

        // configure the slider
        this.sliderRef.current.value = 0
        this.sliderRef.current.min = this.wavesurfer.current.params.minPxPerSec;
        this.sliderRef.current.max = 500;

        // reset the zoom level
        this.wavesurfer.current.zoom(this.sliderRef.current.value);
        this.wrapper = this.wavesurfer.current.drawer.wrapper;

    }

    componentWillUnmount(){
        window.addEventListener('beforeunload', (event) => {
            event.preventDefault();
            document.removeEventListener('keydown', this.handleKeyPress);
            window.removeEventListener('resize', this.handleResize);
            console.log('unmounting')
       })
      }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.rows !== prevState.rows) {
            console.log('update')
        }
    }

    handleAddRegions = (data) => {
        
        // show the regions in the waveform
        data.forEach(item => {
           
                    var tempRow  = item;
                    // tempRow['color'] = 'rgba(197, 180, 227, .25)';
                    // tempRow['handleStyle'] = {left:{backgroundColor: "black"}, right:{backgroundColor: "black"}}
                    this.wavesurfer.current.addRegion(tempRow);
                
        });

        
    }

    handleResize = () => {
        this.wavesurfer.current.drawer.containerWidth = this.wavesurfer.current.container.clientWidth;
        this.wavesurfer.current.drawBuffer();
    }

    handleRegionCreated = (region) => {
    console.log(this.state.rows)
    console.log(region)
    // verify that the region is not already in the array
    if (!this.state.rows.some(e=>e.id === region.id)) {
        // check if there are no regions yet
        this.handleAddIdtoNewRegion(region);
    } else {
        // id the region is already in the array find it on the list and update the region
        //find index of region
        const idx = this.state.rows.findIndex(e=>e.id === region.id);
        //update region
        const rows = this.state.rows;
        rows[idx] = {
                id:  rows[idx].id,
                start: region.start.toFixed(3),
                end: region.end.toFixed(3),
            }
        this.setState({ rows: rows });
        
    }

    }

    handleAddIdtoNewRegion = (region) => {
        // check if there are no regions yet
        if (this.state.rows.length === 0) {
            // create a new region and update the list of regions
            var item=null;
            item = {
                //id:  region.id,
                id: "Rep1",
                start: Number(region.start.toFixed(3)),
                end: Number(region.end.toFixed(3)),
            };

            this.setState({
                rows: [...this.state.rows, item]
            }, () => {
                region.remove()
                this.handleAddRegions([item]);
                });
        } else //there are regions already, add a new one
            {
            // get the last region  'id'
            const lastRegion = this.state.rows[this.state.rows.length - 1].id;
            // get the nymber of the last region
            const lastRegionNumber = Number(lastRegion.substring(3, lastRegion.length));
            // create a new region and update the list of regions
            var item = null; 
            item = {
                //id:  region.id,
                id: "Rep" + (this.state.rows.length+1),
                start: Number(region.start.toFixed(3)),
                end: Number(region.end.toFixed(3)),
            };

            this.setState({
                rows: [...this.state.rows, item]
            }, () => {
                region.remove()
                this.handleAddRegions([item]);
                });
        }


    }


    handleRegionRemoved = (region) => {
        console.log(region.id)
    }


    handleRegionClick = (region, event) => {
        
        // select a region and change the handle color depending on what section of the region the user clicks

        // get time of cursor (where the user clicks) Code taken directly from wavesurfer cursor plugin 
        const duration = this.wavesurfer.current.getDuration();
        const elementWidth =this.wavesurfer.current.drawer.width / this.wavesurfer.current.params.pixelRatio;
        const scrollWidth = this.wavesurfer.current.drawer.getScrollX();

        const scrollTime =
            (duration / this.wavesurfer.current.drawer.width) * scrollWidth;

        const bbox = this.wrapper.getBoundingClientRect();
        let x = this.wrapper.scrollLeft + event.clientX - bbox.left;

        const timeValue = Math.max(0, ((x - this.wrapper.scrollLeft) / elementWidth) * duration) + scrollTime;
    
        // compare cursor position with begining or end of region and decide which are you will change
        
        if ((Math.abs(timeValue-region.start)<= 0.2) || (Math.abs(timeValue-region.end)<= 0.2)) {

            // change the handle color
            if (Math.abs(timeValue-region.start)<= 0.2) {
                this.regionToChange = {"id" : region.id, 
                                    "position" : "start"}
                region['color'] = "rgba(225,87,89, .25)";
                //modify region handleStyle
                region['handleStyle'] = {left:{backgroundColor: "red"},
                                        right:{backgroundColor: "black"}} 


                //this.wavesurfer.current.seekTo(region.start / this.wavesurfer.current.getDuration())
                //remove cursor
                // console.log(this.videoRef.current.currentTime)                         
                // console.log(region.start)

                // this.handlePause();
                // this.videoRef.current.currentTime = region.start;
                // this.handleTimeUpdate();

                // console.log(this.videoRef.current.currentTime)                         
                // console.log(region.start)
                // console.log(this.wavesurfer.current.time)

            } else if (Math.abs(timeValue-region.end)<= 0.2) {
                this.regionToChange = {"id" : region.id, 
                                    "position" : "end"}
                region['color'] = "rgba(225,87,89, .25)";
                //modify region handleStyle
                region['handleStyle'] = {left:{backgroundColor: "black"},
                                        right:{backgroundColor: "red"}}

                this.videoRef.current.currentTime = region.end;
            }

            region.remove();                          
            this.wavesurfer.current.addRegion(region);
            
            //update state
            // region['handleStyle'] = {left:{backgroundColor: "red",
            //                                 width : '10px'},
            //                          right:{backgroundColor: "black"}}

            Object.keys(this.wavesurfer.current.regions.list).map((id) => {

                if (id !== region.id) {
                    var temp_reg = this.wavesurfer.current.regions.list[id];
                    temp_reg['color'] = "rgba(197, 180, 227, .25)";
                    temp_reg['handleStyle'] = {left:{backgroundColor: "black"},
                                                right:{backgroundColor: "black"}}
                    temp_reg.remove()
                    this.wavesurfer.current.addRegion(temp_reg);
                }
            }

            )

     
            this.wavesurfer.current.play(region.start, duration)

            // console.log(this.wavesurfer.current.getCurrentTime()) 
            // setTimeout(this.wavesurfer.current.seekTo(region.start / this.wavesurfer.current.getDuration()),100)
            // console.log(this.wavesurfer.current.getCurrentTime())
            // console.log(this.videoRef.current.currentTime)
            // this.handlePause();
            // const proposedTime = region.start
            // this.videoRef.current.currentTime = proposedTime;
            // //this.videoRef.current.fastSeek = proposedTime;
            // this.videoRef.current.play().then(() => {
            //     this.videoRef.current.pause()})
            // this.handleTimeUpdate();
            // console.log(this.videoRef.current.currentTime)
        } else {
            this.handleDeselectAll()
        }
        // redraw buffer
        //this.wavesurfer.current.drawBuffer();
        //console.log(this.wavesurfer.current.regions.list)
        
    }

    handleDeselectAll = () => {
        this.regionToChange = null // variable that indicates what region is going to be modified 
        Object.keys(this.wavesurfer.current.regions.list).map((id) => {
            var temp_reg = this.wavesurfer.current.regions.list[id];
            temp_reg['color'] = "rgba(197, 180, 227, .25)";
            temp_reg['handleStyle'] = {left:{backgroundColor: "black"},
                                        right:{backgroundColor: "black"}}
            temp_reg.remove()
            this.wavesurfer.current.addRegion(temp_reg);      
        }
        )
    }

    handleSliderChange = (event) => {
        //console.log('in', Number(event.target.value));
        this.wavesurfer.current.zoom(Number(event.target.value))
        //console.log('ws', this.wavesurfer.current.params.minPxPerSec)
        //this.wavesurfer.current.fireEvent('zoom', Number(event.target.value))
    }
    
    // run the tick function once data is avaliable
    loadedData = () => {
        this.videoRef.current.play();
        this.videoRef.current.requestVideoFrameCallback(this.findFrameRate)

        // // check if there is a parse file
        // if (this.props.parse_file)
        // { //read file and save it in a list of rows
        //     fetch(this.props.parse_file) //read the file
        //         .then(response => response.json())
        //         .then(data => {
        //             // // update the state with the new data and print the table
        //             this.setState({
        //                 rows : data,
        //             })
                
        //             this.handleAddRegions(data)
                    
        //         }
        //         )
        // } else
        // {
        //     console.log('not parsing file')
        // }


        // fetch(this.props.parse_file) //read the file
        //     .then(response => {
        //                 if(response.ok) return response.json();
        //                 else throw new Error("Not 2xx response", {cause: response});
        //          })
        //     .then(data => {
        //             // // update the state with the new data and print the table
        //             this.setState({
        //                 rows : data,
        //             })
                    
        //             this.handleAddRegions(data)
        //             console.log(data)
        //         }
        //         )
        //     .catch(error=>console.log(error))

    }

    handleMoveForward = (numFrames) => {
        if(this.videoRef.current !== null) {
            if ( this.estimatedFrameRate > 0) {
                const proposedTime = this.videoRef.current.currentTime + numFrames/this.estimatedFrameRate;
                if (proposedTime <= this.videoRef.current.duration) {
                    this.handlePause();
                    this.videoRef.current.currentTime = proposedTime;
                } else {
                    this.handlePause();
                    this.videoRef.current.currentTime = this.duration;
                }



                // // update region if it is selected
                // if (this.regionToChange !== null) {

                //     const idx = this.state.rows.findIndex(e=>e.id === this.regionToChange.id);
                //     //update region
                //     const rows = this.state.rows;
                //     if (this.regionToChange.position === "start") {
                //         rows[idx] = {
                //                 id:  rows[idx].id,
                //                 start: this.videoRef.current.currentTime.toFixed(3),
                //                 end: rows[idx].end.toFixed(3),
                //             }
                //     } else {
                //         rows[idx] = {
                //                 id:  rows[idx].id,
                //                 start: rows[idx].start.toFixed(3),
                //                 end: this.videoRef.current.currentTime.toFixed(3),
                //             }
                //     }

                //     this.setState({ rows: rows });
                // }
            }
        }
    }

    handleMoveBackward = (numFrames) => {
        // check if the video is exists 
        if(this.videoRef.current !== null) {
            if ( this.estimatedFrameRate > 0) {
                const proposedTime = this.videoRef.current.currentTime - numFrames/this.estimatedFrameRate;
                if (proposedTime >= 0) {
                    this.handlePause();
                    this.videoRef.current.currentTime = proposedTime;
                } else {
                    this.handlePause();
                    this.videoRef.current.currentTime = 0;
                }
            }
        }
    }

    

    // function that handles the click event
    handleClick= (event) => {
        
        switch (event.target.value) {
            case 'previousFrame':
                this.handleMoveBackward(1)     
                break;
            case 'previousFrame_5':
                this.handleMoveBackward(5);
                break;
            case 'nextFrame':                 
                this.handleMoveForward(1);
                break;
            case 'nextFrame_5':
                this.handleMoveForward(5);
                break;
            case 'Play':
                if(this.playVideo.current.textContent === 'Play')  {
                    this.handlePlay()
                } else {
                    this.handlePause()
                }
                break;
            case 'Segment Repetition' :
                this.videoRef.current.pause()
                if (this.Repetition.current.textContent === 'Start Repetition')
                    {
                        // add repetition to table 
                        this.handleAddRow() // add row to table with init time and rep name
                    } else {
                        // add end time to table
                        this.handleAddEndTime() 
                    }
                break;
            case 'Save':
                this.handleSave(event)
                
                break;
            case 'load':
                this.inputFile.current.click();
                break;
            default:
                break;
        }
      
    };

    handleSave = () => {
        // check if the table is not empty
        console.log(this.state.rows)
        if (this.state.rows.length > 0 ) {
            var blob = new Blob([JSON.stringify(this.state.rows)], {type: 'text/plain'});
            // this.props.childToParentCallback({
            //     "blob": blob,
            // });
            const url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            //a.style.display = 'none';
            a.target = '_blank';
            a.type = 'button';
            a.href = url;
            a.download = this.state.file_name.split(".")[0]+'.parse'; // get file name without extension
            document.body.appendChild(a);
            a.click(function (event){
                event.preventDefault();
            });
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    }

    fileUpload = (event) => {
        const file = event.target.files[0];

        let reader = new FileReader();
        reader.onload = (e) => {
            this.videoRef.current.src = e.target.result;
        }

        reader.onloadstart = (e) => {
            this.videoRef.current.poster = 'loading-gif3.gif'
            // this.loadingAnimation.current.style.display = 'block';
            // this.videoRef.current.style.display = 'none';
            this.loadButtonTag.current.disabled = true;
            
        }
        // reader.onprogress = function(event) {
        //     if (event.lengthComputable) {
        //         if (LoadingBarVisible)
        //             ShowLoadingBar();
        //         AddProgress();
        //     }
        // };
        reader.onloadend = (e) => {

            // this.videoRef.current.style.display = 'block';
            // this.loadingAnimation.current.style.display = 'none';
            
            
            this.wavesurfer.current.load(this.videoRef.current);
            this.videoRef.current.setAttribute('controls', 'true');
            this.loadButtonTag.current.disabled = false;

        };

        reader.onerror = function(event) {
            console.log(event.target.error);
        };
        reader.readAsDataURL(file);
        this.setState({file_name : file.name})

    }


    handleDoubleClick = (event) => {
        // check if the frame rate is set (this is the initial task )
        if (this.estimatedFrameRate !== 0) {
            if (event.target.name === 'startTime' || event.target.name === 'endTime') 
            { //verify that there is something in the input field
                if (event.target.value !== ''){
                    const value = +event.target.value; // +string -> converts string to number
                    // verify that is a valid number
                    if(typeof value === 'number' && !isNaN(value) && value >= 0 && value <= this.videoRef.current.duration) {
                        
                        this.videoRef.current.currentTime = value;
                    }
                }
                
            }

        }
        // double click on table input moves video to correct position and updates the view to show the correct frame
 
    }

    handleKeyPress = (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                if (event.shiftKey){
                    // Ctrl + left arrow moves backward 5 frames
                    this.handleMoveBackward(5);
                } else {
                    // left arrow moves backward 1 frame
                    this.handleMoveBackward(1);
                }
                break;
            case 'ArrowRight':
                if (event.shiftKey){
                    // Ctrl + right arrow moves forward 5 frames
                    this.handleMoveForward(5);
                } else {
                    // right arrow moves forward 1 frame
                    this.handleMoveForward(1);
                }
                break;
            case event.ctrlKey && 's':
                // create a zero-size region in the correct time and store the time in a variable

                if (this.state.startTimerRegionKeyboard === null) {
                    const tempRegion = []
                    tempRegion['id'] ='temp'
                    tempRegion['start'] = this.wavesurfer.current.getCurrentTime();
                    tempRegion['end'] = this.wavesurfer.current.getCurrentTime() ;
                    tempRegion['color'] = 'hsla(400, 100%, 30%, 0.1)';
                    this.wavesurfer.current.addRegion(tempRegion);
                    this.setState({
                        startTimerRegionKeyboard: this.wavesurfer.current.getCurrentTime(),
                        })
                }
                else {
                    // list all regions and find the one with id = temp
                    const regions = this.wavesurfer.current.regions.list;
                    for (const region in regions) {
                        console.log(regions[region].id)
                        const reg = regions[region];
                        if (reg.id === 'temp') {
                            //remove the region
                            reg.remove()
                            // this.wavesurfer.current.regions.list[region].remove();

                            // add a new region with the correct start and end time
                            const regionToAdd = []
                            regionToAdd['start'] = this.state.startTimerRegionKeyboard;
                            regionToAdd['end'] = this.wavesurfer.current.getCurrentTime() ;
                            regionToAdd['color'] = 'hsla(400, 100%, 30%, 0.1)';
                            const region = this.wavesurfer.current.addRegion(regionToAdd);
                            this.handleAddIdtoNewRegion(region);

                            this.setState({
                                startTimerRegionKeyboard: null,
                                })

                            }
                        }
                    }

                
                break;

            case " ":
                // space bar plays/pauses the video
                if (this.videoRef.current.paused) {
                    this.videoRef.current.play();
                } else {
                    this.videoRef.current.pause();
                }
           
                break;

            case "Escape":
                // escape de-selects all the regions
                this.handleDeselectAll();
            default:
                break;
        }
      };

    handlePause = () => {
        this.videoRef.current.pause();
        this.playVideo.current.textContent = 'Play';
    }

    handlePlay = () => {
        this.videoRef.current.play();
        this.playVideo.current.textContent = 'Pause';
       
        
    }

    handleZoomChange = (event) => {
        this.setState({
            videoWidth: event.target.value
        })
    }


    handleTimeUpdate = () => {

        if (this.estimatedFrameRate > 0)    {
            // update the current time
            const video = this.videoRef.current;
            // const canvas = this.canvasRef.current;
            // canvas.height = video.videoHeight/2;
            // canvas.width = video.videoWidth;   
            // const ctx = canvas.getContext("2d");
            // //
            // ctx.font = "40px Arial";
            // ctx.fillStyle = "white";
            // ctx.textAlign = "center"; 
            // ctx.fillText(this.videoRef.current.currentTime.toFixed(3)+' s', canvas.width-100, 50);
        }
    }

    findFrameRate = () => {

     
        const video = this.videoRef.current;
        // const canvas = this.canvasRef.current;
        // canvas.height = video.height
        // canvas.width = video.width
        // const ctx = canvas.getContext("2d");
        // canvas.style.backgroundColor = 'black';
        // // 
        // ctx.font = "120px Arial";
        // ctx.fillStyle = "white";
        // ctx.textAlign = "center"; 
        // ctx.fillText("Loading", canvas.width/2, canvas.height/2);



        //if (!video.paused) {
            var currentVideoTime = video.currentTime

            if (currentVideoTime !== this.previousTime){
                // console.log(1/(currentVideoTime-this.previousTime))
                this.arrayFrameRate.push(1/(currentVideoTime-this.previousTime))
                this.previousTime = currentVideoTime
                
            }

       // }

        if (this.frameCounter <=  15)
        {
            this.frameCounter++
            this.videoFrameCallbackRef = this.videoRef.current.requestVideoFrameCallback(this.findFrameRate)
            
        } else {

            this.handlePause()
            this.estimatedFrameRate = average(this.arrayFrameRate.slice(5));
            console.log(this.estimatedFrameRate);
            this.frameCounter = 0;
            video.currentTime = 0;
            video.muted = false;
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            // canvas.height = video.videoHeight/2;
            this.videoRef.current.muted = false;
            // canvas.style.backgroundColor = 'transparent';
            
        }

    }

    // table related functions start here
    handleChange = idx => event => {
        // ToDo : verify that value entered in the columns startTime and endTime are 
        // valid numbers and that startTime is less than endTime
        const { name, value } = event.target;
        const rows = [...this.state.rows];

        switch (name) {
            case 'startTime':
                rows[idx].start = Number(value);
                break;
            case 'endTime':
                rows[idx].end = Number(value);
                break;
            case 'repName':
                rows[idx].repname = value;
                break;
            default:
                break;
        }
        this.setState({rows: rows});
        this.wavesurfer.current.regions.list[rows[idx].id].update({ start: rows[idx].start , end: rows[idx].end });
    //     // verify if the subject enter the End Time by hand
    //    if (name === 'endTime') {    
    //         this.Repetition.current.textContent = 'Start Repetition'  
    //   }
      };

    handleRemoveRow = () => {
        this.setState({
          rows: this.state.rows.slice(0, -1)
        });
      };
    handleRemoveSpecificRow = (idx) => () => {
        
        const rows = [...this.state.rows];
        const id = rows[idx].id;
        console.log(rows[idx].id);
        console.log(this.wavesurfer.current.regions.list);
        
        rows.splice(idx, 1);
        this.setState({ rows: rows });
        //this.wavesurfer.current.regions.list[id].remove();
        this.wavesurfer.current.clearRegions()
       
        this.handleAddRegions(rows)
        console.log(this.wavesurfer.current.regions.list);
        
      };


    onDragStart = (e) => {
            this.draggedRow = e.target;
            console.log(this.draggedRow);
    }   

    onDragOver = (e) => {
        e.preventDefault();

        let children= Array.from(e.target.parentNode.parentNode.children);
        if(children.indexOf(e.target.parentNode)>children.indexOf(this.draggedRow))
            e.target.parentNode.after(this.draggedRow);
        else
            e.target.parentNode.before(this.draggedRow);
    }
        

    // table related functions end here

    render() {
        return (
            <div className="vslp-webcam">
            <center>
            <div className="figureheader">
                    <input type='file' id='file' ref={this.inputFile} onChange={this.fileUpload} style={{display: 'none'}}/>
                    <button style = {{ width:'25%', minWidth:'200px'}} type="button" value='load' ref={this.loadButtonTag}  onClick={this.handleClick} disabled={false}>Load Video</button>
            </div>

            <div className="zoom-selector">
                <label htmlFor="zoomselect" style={{marginLeft : '10px'}}>Video Size</label>
                <select id="zoomselect" defaultValue={'50%'} ref={this.zoomSelect} onChange={this.handleZoomChange}>
                    <option value="100%">100%</option>
                    <option value="90%">90%</option>
                    <option value="80%">80%</option>
                    <option value="70%">70%</option>
                    <option value="60%">60%</option>
                    <option value="50%" >50%</option>
                    <option value="40%">40%</option>
                    <option value="30%">30%</option>
                    <option value="20%">20%</option>
                    <option value="10%" >10%</option>
                </select>
            </div>

            <div className="video-container">
            <video controls
                preload="auto"
                //src = {this.props.src}
                ref = {this.videoRef}
                autoPlay = {false}
                loop = {false}
                onLoadedMetadata = {this.loadedData}
                // onCanPlay = {this.loadedData}
                // onLoadedData= {this.loadedData} //what to do once data in avaliable in video
                onPause = {this.handlePause}
                onPlay = {this.handlePlay}
                onTimeUpdate = {this.handleTimeUpdate}
                muted = {true}
                style = {{
                    zIndex : 1, //video is shown in layer 1 
                    display : 'block',
                    width : this.state.videoWidth,
                }}
            /> 
            </div>
                
                <div className="btn-toolbar text-center well" style = {{ width:'100%'}}>
                <button style = {{ width:'15%', minWidth:'75px', maxWidth:'75px'}} type="button " value='previousFrame_5' ref={this.previousFrame_5} onClick={this.handleClick} disabled={false}>-5</button>
                <button style = {{ width:'15%', minWidth:'75px', maxWidth:'75px'}} type="button" value='previousFrame' ref={this.previousFrame} onClick={this.handleClick} disabled={false}>-1</button>
                <button style = {{ width:'40%', minWidth:'150px', maxWidth:'150px'}} type="button" value='Play' ref={this.playVideo} onClick={this.handleClick} disabled={false}>Play</button>
                <button style = {{ width:'15%', minWidth:'75px', maxWidth:'75px'}} type="button" value='nextFrame' ref={this.nextFrame} onClick={this.handleClick} disabled={false}>+1</button>
                <button style = {{ width:'15%', minWidth:'75px', maxWidth:'75px'}} type="button" value='nextFrame_5' ref={this.nextFrame_5} onClick={this.handleClick} disabled={false}>+5</button>
                </div>
       <div className = "container-waveform" style ={{
            // position: 'absolute',
            overflow: 'hidden', 
            width: "100%",
            // height: 100,  

       }}>
        <div  id="waveform" ref={this.waveFormRef} 
                      style={{ 
                       position: 'relative', 
                       //border: "1px solid grey", 
                       width: "75%", 
                       height: 100,
                       margin: "auto", 
                       marginTop: "10px", 
                       marginBottom: "10px",
                       transform: "translateY(-100%)",
                       //top: "-50%",
                }}/>
          <div id="wave-timeline" ref={this.timelineRef} style = {{width: "75%",}}></div>
          <div id="wave-minimap" ref={this.minimapRef} style = {{width: "75%",}}></div>
        </div>
         
        <div className="slider">
            <label htmlFor="slider" id="slider-label" style={{ float: "left", marginLeft:"1%", marginTop: "20px", marginBottom: "20px"}}>Zoom</label>
            <input type="range" min="0" max="500" defaultValue="0" id="slider" ref={this.sliderRef} onChange={this.handleSliderChange} style={{ width: "15%", float: "left", marginLeft:"1%", marginTop: "20px", marginBottom: "20px"}}/>
        </div>

        

        <table className="styled-table">
         <caption style={{textAlign:'center', fontSize:'xx-large', marginTop: '15px', marginBottom: '15px'}}> Segmentation </caption>
            <thead>
                <tr>
                    <th>Rep Name</th>
                    <th>Start Time</th>                
                    <th>End Time</th>
                    <th />
                </tr>
            </thead>
            <tbody>
                  {this.state.rows.map((item, idx) => (
                    <tr draggable='true' onDragStart={this.onDragStart} onDragOver={this.onDragOver} id="addr0" key={idx}>
                    <td >
                        <input
                          type="text"
                          name="repName"
                          defaultValue={this.state.rows[idx].id}
                          onChange={this.handleChange(idx)}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          //todo: verify that value entered in the columns startTime and endTime are
                          // valid numbers and that startTime is less than endTime
                          type="number"
                          min = "0"
                          name="startTime"
                          value={this.state.rows[idx].start}
                          onChange={this.handleChange(idx)}
                          className="form-control"
                          onDoubleClick={this.handleDoubleClick}
                        />
                      </td>
                      <td>
                        <input
                          //todo: verify that value entered in the columns startTime and endTime are
                          // valid numbers and that startTime is less than endTime
                          type="number"
                          min = "0"
                          name="endTime"
                          value={this.state.rows[idx].end}
                          onChange={this.handleChange(idx)}
                          className="form-control"
                          onDoubleClick={this.handleDoubleClick}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={this.handleRemoveSpecificRow(idx)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
        </table>

        <div className="save-button">
            <button style = {{ width:'25%', minWidth:'200px'}}  type="button" value='Save' ref={this.save} onClick={this.handleClick} disabled={false}>Save</button>
        </div>


        <div style={{marginTop : '15px'}}>
        <a href="https://storage.googleapis.com/vslp-bucket-dev-util-store/instructions/online-parsing-tool-instructions.pdf" download  target="_blank" rel="noreferrer">
                <b>Download Instructions</b>
            </a>
        </div>
        </center>

        {/* <canvas hidden ref={this.canvaForWaveColorRef} /> */}

      

        </div>
            
        );
    }


}

export default VideoAudioParsing;