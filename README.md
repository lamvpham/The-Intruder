# The Intruder

### **Built with [p5.js](https://p5js.org/) and [ml5.js](https://ml5js.org/)**

Using computer vision to process the participant’s body as the medium in a motion heatmap generative artwork. The head is the focal point, where the eyes are shown as red and are constantly being tracked. When too much motion occurs, the dark pixelation is removed and the pure video feed of the viewer is shown as a sign that they have been caught. 

<img src="https://github.com/lamvpham/TheIntruder/blob/main/image1.png?raw=true" width="1000" title="Image" alt="Image">
<img src="https://github.com/lamvpham/TheIntruder/blob/main/image2.png?raw=true" width="1000" title="Image" alt="Image">


## Formal Qualities
The canvas is a centered, 640px by 480px, frame with the HTML document background being black, and changing to red when the pure video feed is active. When the pixelated heatmap is active, there is red text indicating the screen is ‘recording’ with a timestamp. As the viewer moves around, that is captured as red pixels on the canvas that get brighter red as more movement in that same area is detected - more movement also increases the static sound effect. Once enough movement has been detected, the screen flips to the pure video feed with the ml5.js facemesh bounding box to indicate that the viewer is an intruder with an alarm sound effect. Once the viewer stops moving, the video feed turns to the dark mode pixelated heat map view.

## Context
The design is meant to be creepy and eerie to the viewer, with the pitch black and bright red colours, alongside the building tension from the static sound, coming to the climax of the alarm system beeping loudly and scaring the viewer. The panic of not knowing what to do will eventually subside to them understanding that they need to stop moving for the detection to go away. Despite all this, the red eyes from the facemesh are in place so that even in the dark mode, you are constantly being watched. Surveillance is the key theme in this concept, and is meant to be unnerving to the viewer.  
  
The concept of heatmaps is being visualized on the human body in real-time to explore the relationship between physical presence and digital representation. Making this a participatory experience that changes over time through the heatmap, the story arc of ‘The Intruder’ prompts viewers to reflect on their visibility and surveillance in the digital age.

## Technical Description
The main aspect of the code comes from the variable preFrame, which is used to store previous frames and compare them with the current frame’s incoming RGB values, which helps to indicate motion in that specific area. Extending beyond the code from the medium article, the main functions include UI elements (such as the recording text, timer text, red eyes and bounding box) as well as the heatmap and pixelation code. The ml5.js library was used in this assignment with the facemesh component, where the red eyes and bounding box functions track the viewer’s face. 
