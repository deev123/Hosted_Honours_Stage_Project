// Slice viewer is a viewport for viewing and scrolling through a slice of the volume
// it contains a canvas for rendering a slice from the Volume object
class SliceViewer
{
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

    loaded = false;

    // obsolete now setVolume works it out
    // setSize(x, y, pscrollMax)
    // {
    //     // xSize and ySize might be redundant because it is contained in canvas?
    //     this.scrollMax = pscrollMax
    //     this.xSize = x;
    //     this.ySize = y;
    //     this.canvas.width = x;
    //     this.canvas.height = y;

    // }

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

        this.parentElement.appendChild(this.canvas);

        this.parentElement.addEventListener("wheel", (event) => this.sliceScroll(event));


    }

    render(imageData)
    {
        this.canvas.width = this.xSize;
        this.canvas.height = this.ySize;
        this.canvas.style.opacity = `${this.opacity}%`;
        this.canvas.getContext("2d").putImageData(imageData, 0, 0);
    }

    sliceScroll(event)
    {
        if(this.loaded)
        {
            //console.log(this);
            // console.log(this.volume);  // this will refer to the function from the event handler!!
            event.preventDefault();
            event.stopPropagation();

            // when scroll is negative we want floor, when negative we want ceiling
            if (event.deltaY > 0) this.index = Math.ceil(this.index - (event.deltaY * this.scrollMultiplier)); // inverted feels better to have upscroll as forwards through volume
            else this.index = Math.floor(this.index - (event.deltaY * this.scrollMultiplier));

            if(this.index < 0) this.index = 0;
            else if (this.index >= this.scrollMax) this.index = this.scrollMax -1;
            
            // print the scroll amount about 133 or -133 for my browser and mouse
            // console.log(this.index);

            let imgDat;
            if(this.axis === "x") imgDat = new ImageData(this.volume.volumeXSlice(Math.floor(this.index)), this.xSize, this.ySize);
            if(this.axis === "y") imgDat = new ImageData(this.volume.volumeYSlice(Math.floor(this.index)), this.xSize, this.ySize);
            if(this.axis === "z") imgDat = new ImageData(this.volume.volumeZSlice(Math.floor(this.index)), this.xSize, this.ySize);
            
            this.render(imgDat);
            this.updateSliceNum(Math.floor(this.index));
        }

    }

    updateSliceNum(number)
    {
        // console.log(this.parentElement.parentElement);
        let num = this.parentElement.parentElement.querySelector(".slice-number");
        num.innerText = number;
    }

    nextSlice()
    {
        // console.log(this.index);
        // faking an event is easier as it allows us to easily update the drawer too!
        let singleScrollMagnitude = (-1 / this.scrollMultiplier);
        let syntheticEvent = new WheelEvent("wheel", {deltaX: 0, deltaY: singleScrollMagnitude, bubbles: true, cancelable: true,});
        this.parentElement.dispatchEvent(syntheticEvent);
        // if (this.index < this.scrollMax - 1) this.index = this.index + 1;
        // else this.index = this.scrollMax - 1;

        // let imgDat;
        // if(this.axis === "x") imgDat = new ImageData(this.volume.volumeXSlice(Math.floor(this.index)), this.xSize, this.ySize);
        // if(this.axis === "y") imgDat = new ImageData(this.volume.volumeYSlice(Math.floor(this.index)), this.xSize, this.ySize);
        // if(this.axis === "z") imgDat = new ImageData(this.volume.volumeZSlice(Math.floor(this.index)), this.xSize, this.ySize);
        
        // this.render(imgDat);
        // this.updateSliceNum(Math.floor(this.index));
    }

    previousSlice()
    {
        let singleScrollMagnitude = (1 / this.scrollMultiplier);
        let syntheticEvent = new WheelEvent("wheel", {deltaX: 0, deltaY: singleScrollMagnitude, bubbles: true, cancelable: true,});
        this.parentElement.dispatchEvent(syntheticEvent);
    }


}
