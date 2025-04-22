// class for drawing slices of a volume, not for viewing
// use slice viewer to view the volume at the same index

// a slice viewer for bothe the real volume and the volume being drawn needs to be added to the parent container
// the parent container must handle all the events for the sliceviewer and slicedraweretc

// a slice drawer has a sliceviewer and a volume and handles events for drawing and scrolling through the volume
// it is very similar to sliceviewer

class SliceDrawer
{
    volume;

    index = 0;
    canvas;
    xSize = 0;
    ySize = 0;
    width = 0;
    height = 0;
    parentElement;
    volume;  // the slice viewer uses a Volume object to render slices of it based on the index
    scrollMultiplier = 1/100;  // a value to control the speed of the scroll
    scrollMin = 0;
    scrollMax = 0; // use this instead of the ...Size fields to make more abstract for any plane
    axis;  // track which axis is being sliced through

    opacity = 100;
    canvasCtx;
    lineWidth = 50;
    drawing = false;
    drawingColour = "green";

    eraserMode = false;

    loaded = false;

    // ctx.globalCompositeOperation = "destination-out";  for eraser mode
    // "source-over" for pen mode

    setVolume(pvolume, sliceAxis)
    {
        // console.log("volume set");
        this.volume = pvolume;
        // console.log(this.volume);
        // based on the axis given either "x", "y", or "z" set the dimensions
        if(sliceAxis === "x") //sagittal
        {
            this.scrollMax = this.volume.xSize;
            this.xSize = this.volume.ySize;
            this.ySize = this.volume.zSize;
            this.canvas.width = this.xSize;
            this.canvas.height = this.ySize;
        }
        else if(sliceAxis === "y") // coronal
        {
            this.scrollMax = this.volume.ySize;
            this.xSize = this.volume.xSize;
            this.ySize = this.volume.zSize;
            this.canvas.width = this.xSize;
            this.canvas.height = this.ySize;
        }
        else if(sliceAxis === "z") // axial
        {
            this.scrollMax = this.volume.zSize;
            this.xSize = this.volume.xSize;
            this.ySize = this.volume.ySize;
            this.canvas.width = this.xSize;
            this.canvas.height = this.ySize;
        }
        this.axis = sliceAxis;
        
        this.loaded = true;
    
        // the canvas is set to the correct width and height and never needs to change but we need to fill it
        // with pixels from the correct slice of the volume
        // we can do this the same way as the sliceViewer


        // changing the canvas width and height results in a cleared context so we need
        // to set the context again and render it

        let imgDat;
        if(this.axis === "x") imgDat = new ImageData(this.volume.volumeXSlice(Math.floor(this.index)), this.xSize, this.ySize);
        if(this.axis === "y") imgDat = new ImageData(this.volume.volumeYSlice(Math.floor(this.index)), this.xSize, this.ySize);
        if(this.axis === "z") imgDat = new ImageData(this.volume.volumeZSlice(Math.floor(this.index)), this.xSize, this.ySize);
        this.render(imgDat);
    
    }

    // pwidth and pheight are strings like "100%" or "100px"
    constructor(pparentElement, pwidth, pheight)
    {
        this.parentElement = pparentElement;
        // this.xSize = pxSize;
        // this.ySize = pySize;
        this.canvas = document.createElement("canvas");
        // this.canvas.width = this.xSize;
        // this.canvas.height = this.ySize;
        this.canvas.style.width = pwidth;
        this.canvas.style.height = pheight;
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px";
        this.canvas.style.imageRendering = "pixelated";
        this.canvasCtx = this.canvas.getContext("2d");

        this.parentElement.appendChild(this.canvas);

        this.parentElement.addEventListener("wheel", (event) => this.sliceScroll(event));
        this.addEventListeners(this);

    }

    setLineWidth(lineWidth)
    {
        this.lineWidth = lineWidth;
        this.canvasCtx.lineWidth = lineWidth;
    }

    setEraseMode(boolErase)
    {
        if(boolErase)
        {
            this.canvasCtx.globalCompositeOperation = "destination-out";
            this.eraserMode = true;
            this.canvasCtx.beginPath();
            this.drawing = false;
        }
        else
        {
            this.canvasCtx.globalCompositeOperation = "source-over";
            this.eraserMode = false;
            this.canvasCtx.beginPath();
            this.drawing = false;
        }
    }

    render(imageData)
    {
        this.canvas.width = this.xSize;
        this.canvas.height = this.ySize;
        this.canvas.style.opacity = `${this.opacity}%`;
        this.canvas.getContext("2d").putImageData(imageData, 0, 0);

        // after rendering set up the canvas context
        this.canvasCtx = this.canvas.getContext("2d");
        // console.log("set canvas context");
        // console.log(this.canvasCtx);

        this.canvasCtx.strokeStyle = this.drawingColour;
        this.canvasCtx.fillStyle = this.drawingColour;
        this.canvasCtx.lineWidth = this.lineWidth;

        if(this.eraserMode)
        {
            this.canvasCtx.globalCompositeOperation = "destination-out";
        }
        else
        {
            this.canvasCtx.globalCompositeOperation = "source-over";
        }

        // then we can add the handlers for drawing
        //this.removeEventListeners(this);

        // this.canvasElement.parentElement.removeEventListener(this.mouseDownListener);

        // this.mouseDownListener = (event) => 
        // {
        //     console.log(this);
        //     // as a percentage
        //     let pos = { x: ((event.clientX - this.canvasElement.getBoundingClientRect().left) / (this.canvasElement.getBoundingClientRect().right - this.canvasElement.getBoundingClientRect().left)), y: ((event.clientY - this.canvasElement.getBoundingClientRect().top) / (this.canvasElement.getBoundingClientRect().bottom - this.canvasElement.getBoundingClientRect().top))};
        //     pos.x = pos.x * this.canvasElement.width;
        //     pos.y = pos.y * this.canvasElement.height;
        //     this.drawing = true;
    
        //     //draw circle
        //     // self.canvasCtx.beginPath();
        //     // self.canvasCtx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        //     // self.canvasCtx.fill();
        //     // self.canvasCtx.closePath();
        //     this.drawCircle(pos);
    
        //     this.canvasCtx.beginPath();
        //     this.canvasCtx.moveTo(pos.x, pos.y);
        // };

        // this.canvasElement.parentElement.addEventListeners(this.mouseDownListener);
    }

    sliceScroll(event)
    {
        
        if(this.loaded)
        {
            //console.log(this);
            // console.log(this.volume);  // this will refer to the function from the event handler!!
            event.preventDefault();
            event.stopPropagation();
            
            
            // print the scroll amount about 133 or -133 for my browser and mouse
            // console.log(this.index);

            // create a new canvas each scroll to draw on:
            // 1. Save the current canvas pixels to the volume
            //      - the volume reference doesnt change but the cnavas and canvas context does!
            // get the new scroll index here
            // 2. get the new slice of the volume and set as the current canvas. (Already handled by the sliceviewer code)
            // 3. render it

            // 1.
            
            if(this.axis === "x")
            {
                this.volume.volumeSetXSlice(Math.floor(this.index), this.canvasCtx.getImageData(0, 0, this.xSize, this.ySize).data);
            }
            if(this.axis === "y")
            {
                this.volume.volumeSetYSlice(Math.floor(this.index), this.canvasCtx.getImageData(0, 0, this.xSize, this.ySize).data);
            }
            if(this.axis === "z")
            {
                // console.log("saved image data");
                this.volume.volumeSetZSlice(Math.floor(this.index), this.canvasCtx.getImageData(0, 0, this.xSize, this.ySize).data);
            }
            // TODO


            // get the new scroll index
            // when scroll is negative we want floor, when negative we want ceiling
            if (event.deltaY > 0) this.index = Math.ceil(this.index - (event.deltaY * this.scrollMultiplier)); // inverted feels better to have upscroll as forwards through volume
            else this.index = Math.floor(this.index - (event.deltaY * this.scrollMultiplier));
            
            if(this.index < 0) this.index = 0;
            else if (this.index >= this.scrollMax) this.index = this.scrollMax -1;


            // 2.
            let imgDat;
            if(this.axis === "x") imgDat = new ImageData(this.volume.volumeXSlice(Math.floor(this.index)), this.xSize, this.ySize);
            if(this.axis === "y") imgDat = new ImageData(this.volume.volumeYSlice(Math.floor(this.index)), this.xSize, this.ySize);
            if(this.axis === "z") imgDat = new ImageData(this.volume.volumeZSlice(Math.floor(this.index)), this.xSize, this.ySize);
        
            // 3.
            // also handles setting the new context for the canvas so it is ready to draw with
            //      - Note: The event handlers for drawing use getter functions so that the reference to
            //              the canvas and context doesnt get outdated and to save replacing eventhandlers
            //              (so the references are updated by this function)
            this.render(imgDat);
        }
        // this.drawCircle({x:100, y:100});

        //fake a scroll on the other views to to update them:
        // document.getElementById("viewport1").dispatchEvent(new WheelEvent("wheel", {deltaX: 0, deltaY: 0, bubbles: true, cancelable: true,}));
        // document.getElementById("viewport2").dispatchEvent(new WheelEvent("wheel", {deltaX: 0, deltaY: 0, bubbles: true, cancelable: true,}));
        // document.getElementById("viewport3").dispatchEvent(new WheelEvent("wheel", {deltaX: 0, deltaY: 0, bubbles: true, cancelable: true,}));
    }

    // useful for the event handlers. This function gets the up to date reference
    // to the current canvas context so that the event handlers dont become outdated
    // because we replace the context often
    getCanvasContext()
    {
        // could also just get it from the canvas?
        return this.canvasCtx;
    }

    getCanvas()
    {
        // could also just get it from the canvas?
        return this.canvas;
    }



    // methods for drawing on the canvas:

    drawCircle(pos)
    {
        let ctx = this.getCanvasContext();

        // console.log(ctx);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    //adds the event handlers for drawing to the canvas's parent (the action interface)
    addEventListeners(self)
    {
        // TODO: When drawing it should maybe rerender the other views too to ensure the drawing is seen on them straight away?
        
        let interactionHandler = self.getCanvas().parentElement;
        // console.log(interactionHandler);

        interactionHandler.addEventListener("mousedown", (event) => 
        {
            if(self.loaded)
            {
                let pos = { x: ((event.clientX - self.getCanvas().getBoundingClientRect().left) / (self.getCanvas().getBoundingClientRect().right - self.getCanvas().getBoundingClientRect().left)), y: ((event.clientY - self.getCanvas().getBoundingClientRect().top) / (self.getCanvas().getBoundingClientRect().bottom - self.getCanvas().getBoundingClientRect().top))};
                pos.x = pos.x * self.getCanvas().width;
                pos.y = pos.y * self.getCanvas().height;
                self.drawing = true;

                self.drawCircle(pos);

                self.getCanvasContext().beginPath();
                self.getCanvasContext().moveTo(pos.x, pos.y);
            }
        });

        interactionHandler.addEventListener("mousemove", (event) => 
        {
            if(self.loaded && self.drawing)
            {
                let pos = { x: ((event.clientX - self.getCanvas().getBoundingClientRect().left) / (self.getCanvas().getBoundingClientRect().right - self.getCanvas().getBoundingClientRect().left)), y: ((event.clientY - self.getCanvas().getBoundingClientRect().top) / (self.getCanvas().getBoundingClientRect().bottom - self.getCanvas().getBoundingClientRect().top))};
                pos.x = pos.x * self.getCanvas().width;
                pos.y = pos.y * self.getCanvas().height;

                self.getCanvasContext().lineTo(pos.x, pos.y);
                self.getCanvasContext().stroke();
                self.getCanvasContext().closePath();

                self.drawCircle(pos);
                
                self.getCanvasContext().beginPath();
                self.getCanvasContext().moveTo(pos.x, pos.y);
            }
        });

        interactionHandler.addEventListener("mouseup", (event) =>
        {
            if(self.loaded && self.drawing)
            {
                let pos = { x: ((event.clientX - self.getCanvas().getBoundingClientRect().left) / (self.getCanvas().getBoundingClientRect().right - self.getCanvas().getBoundingClientRect().left)), y: ((event.clientY - self.getCanvas().getBoundingClientRect().top) / (self.getCanvas().getBoundingClientRect().bottom - self.getCanvas().getBoundingClientRect().top))};
                pos.x = pos.x * self.getCanvas().width;
                pos.y = pos.y * self.getCanvas().height;
                self.drawCircle(pos);
                self.sliceScroll(new WheelEvent("wheel", {deltaX: 0, deltaY: 0, bubbles: true, cancelable: true,})); //save drawing to volume
            }
            self.drawing = false;
        });

        // for leaving the canvas without releasing
        interactionHandler.addEventListener("mouseleave", (event) =>
        {
            if(self.loaded && self.drawing)
            {
                let pos = { x: ((event.clientX - self.getCanvas().getBoundingClientRect().left) / (self.getCanvas().getBoundingClientRect().right - self.getCanvas().getBoundingClientRect().left)), y: ((event.clientY - self.getCanvas().getBoundingClientRect().top) / (self.getCanvas().getBoundingClientRect().bottom - self.getCanvas().getBoundingClientRect().top))};
                pos.x = pos.x * self.getCanvas().width;
                pos.y = pos.y * self.getCanvas().height;
                self.drawCircle(pos);
                self.sliceScroll(new WheelEvent("wheel", {deltaX: 0, deltaY: 0, bubbles: true, cancelable: true,})); //save drawing to volume
            }
            self.drawing = false;
        });

        // to make start redrawing if entering the canvas but clicked already
        interactionHandler.addEventListener("mouseenter", (event) =>
        {
            if(self.loaded && event.buttons === 1)
            {
                let pos = { x: ((event.clientX - self.getCanvas().getBoundingClientRect().left) / (self.getCanvas().getBoundingClientRect().right - self.getCanvas().getBoundingClientRect().left)), y: ((event.clientY - self.getCanvas().getBoundingClientRect().top) / (self.getCanvas().getBoundingClientRect().bottom - self.getCanvas().getBoundingClientRect().top))};
                pos.x = pos.x * self.getCanvas().width;
                pos.y = pos.y * self.getCanvas().height;
                
                self.drawCircle(pos);
                self.drawing = true;
                self.getCanvasContext().beginPath();
                self.getCanvasContext().moveTo(pos.x, pos.y);
            }
        });


    }



}

