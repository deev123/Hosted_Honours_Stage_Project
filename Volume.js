//let volume = [];

class Volume
{
    volume;
    xSize = 0;
    ySize = 0;
    zSize = 0;

    /**
     * 
     * @param {*} volumeArray 
     * @param {*} pxSize 
     * @param {*} pySize 
     * @param {*} pzSize 
     */
    constructor()
    {

    }


    /**
     * 
     * @param {*} imageFiles A file list as stored by a file input
     * returns a 3D array of pixels from the files
    */
    load(imageFiles)
    {
        return new Promise((resolve, reject) =>
        {

            const self = this;
            function imagePixels(imageFiles)
            {
                return new Promise((resolve, reject) =>
                {
                    //returns a list of image data arrays
                    let pixelArrays = [];  //will be list of images which are 2D lists of xychannel
                    
                    function loadImage(imageFile)
                    {
                        return new Promise((resolve, reject) =>
                        {
                            let img = new Image();
                            img.src = URL.createObjectURL(imageFile);
                            img.onload = () => resolve(img);
                            img.onerror = () => reject();
                        });
                    }

                    function loadAllImages(imageFiles)
                    {
                        let imageFileArray = Array.from(imageFiles);
                        // console.log(imageFileArray);
                        return Promise.all(imageFileArray.map(loadImage));
                    }

                    loadAllImages(imageFiles)
                    .then((images) => 
                        {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            self.xSize = images[0].width;
                            self.ySize = images[0].height;
                            self.zSize = images.length;
                            // console.log(`(${self.xSize}, ${self.ySize}, ${self.zSize})`);
                            canvas.width = self.xSize;
                            canvas.height = self.ySize;

                            images.forEach((img) => {
                                // be careful it doesnt do anything if the path isnt found
                                ctx.drawImage(img, 0, 0, img.width, img.height);
                                // console.log(ctx.getImageData(0, 0, img.width, img.height));
                                pixelArrays.push(ctx.getImageData(0, 0, img.width, img.height).data);
                                // canvas.style.width = "100%";
                                // canvas.style.height = "100%";
                                // document.getElementById("imageDisplay").appendChild(canvas);
                            });
                            
                            // pixel arrays is returned by imagePixels promise
                            resolve(pixelArrays);
                        });
                });
            }

            imagePixels(imageFiles)
            .then((pixelArrays) =>
            {
                // at this point pixelArrays is a list of Uint8ClampedArrays which contain the ImageData.data of the images
                // (4 8bit values for rgba for each pixel)
                // we need to convert this into one Uint8ClampedArray for the whole volume and define a size of x y z too
                // console.log(pixelArrays);
                //turn the pixelArrays into the final volume array


                let volumeSize = pixelArrays.length * pixelArrays[0].length
                // console.log(volumeSize);
                self.volume = new Uint8ClampedArray(volumeSize);
                // fill in the volume array with the arrays of pixelArrays
                // the resulting volume has 4 8bit numbers for each voxel for rgba like the canvas data
                {
                let currentIndex = 0;
                pixelArrays.forEach((pixelArray) =>
                {
                    self.volume.set(pixelArray, currentIndex);
                    currentIndex += pixelArray.length;
                });
                }
                // console.log(self.volume);
                resolve();

                // let canvas = document.createElement('canvas');
                // canvas.width = 512;
                // canvas.height = 512;
                

                // // console.log(imgDatas[0]);
                // // console.log(canvas.width);
                // let imgDat = new ImageData(volume.slice(0, pixelArrays[0].length), canvas.width, canvas.height);
                
                
                // console.log(imgDat);
                // canvas.getContext('2d').putImageData(imgDat, 0, 0);
                // // be careful it doesnt do anything if the path isnt found
                // // ctx.drawImage(img, 0, 0, img.width, img.height);
                // // console.log(ctx.getImageData(0, 0, img.width, img.height));
                // // pixelArrays.push(ctx.getImageData(0, 0, img.width, img.height).data);

                // canvas.style.width = "100%";
                // canvas.style.height = "100%";
                // document.getElementById("imageDisplay").appendChild(canvas);


            });

        });


    }

    // we need a blank volume for drawing a segmentation etc.
    makeBlankVolume(xSize, ySize, zSize)
    {
        this.xSize = xSize;
        this.ySize = ySize;
        this.zSize = zSize;
        let volumeSize = zSize * xSize * ySize * 4;
        // initialised to 0s by default
        this.volume = new Uint8ClampedArray(volumeSize);
    }

    // if these are called by an EventHandler the function scope is important
    // as this in javascript will refer to the parent function if it is not handled right.

    // slice along z axis (top down) aka axial slice
    volumeZSlice(index)
    {
        // get to work for axial plane first
        if(index < 0) index = 0;
        if(index > this.zSize) index = this.zSize - 1;


        let sliceSize = this.xSize * this.ySize * 4
        let slice = new Uint8ClampedArray(sliceSize);
        // console.log(this.volume)
        slice.set(this.volume.slice(index * sliceSize, (index + 1) * sliceSize));

        return slice;
        // could create a sliceViewer with a first slice given to give dimensions

    }

    // a slice along the x axis (side) aka sagittal slice
    volumeXSlice(index)
    {
        //atm volumeViewer clamps the scroll index with z layers so be careful
        // get to work for axial plane first
        if(index < 0) index = 0;
        if(index > this.xSize) index = this.xSize - 1;  // along x axis

        // slice is y by z pixels in dimension
        let sliceSize = this.ySize * this.zSize * 4
        let slice = new Uint8ClampedArray(sliceSize);
        // console.log(this.volume)



        // to get the correct pixels we need to iterate over the volume backwards by xSize*4 between to get a slice of y of each row
        // and then do this for each z layer which is xSize*ySize*4 apart
        // slice.set(this.volume.slice(index * sliceSize, (index + 1) * sliceSize));

        let sliceI = 0; //every time a voxel is added this increments
        for(let z = 0; z < this.zSize; z++) // for every z layer get the column at the y index
        {
            for(let y = this.ySize - 1; y >= 0; y--)  //backwards along y axis
            {
                let indexStart = (z*4*this.ySize*this.xSize) + (y*4*this.xSize) + (index*4); //index is the start of x rows
                slice.set(this.volume.slice(indexStart, indexStart + 4) , sliceI);
                sliceI += 4;
            }

        }
            
        // console.log(slice);
        return slice;

    }


    // a slice along the y axis aka coronal (front on)
    volumeYSlice(index)
    {
        //atm volumeViewer clamps the scroll index with z layers so be careful
        // get to work for axial plane first
        if(index < 0) index = 0;
        if(index > this.ySize) index = this.ySize - 1;  // clamp along y axis

        // slice is y by z pixels in dimension
        let sliceSize = this.xSize * this.zSize * 4
        let slice = new Uint8ClampedArray(sliceSize);
        // console.log(this.volume)



        // to get the correct pixels we need to iterate over the volume backwards by xSize*4 between to get a slice of y of each row
        // and then do this for each z layer which is xSize*ySize*4 apart
        // slice.set(this.volume.slice(index * sliceSize, (index + 1) * sliceSize));

        let sliceI = 0; //every time a voxel is added this increments
        for(let z = 0; z < this.zSize; z++) // for every z layer get the row at the index
        {
            // console.log(`z=${z}`);
            
            // console.log(`x=${x}`);
            let indexStart = (z*4*this.ySize*this.xSize) + (index*4*this.xSize); //index is the start of x rows
            // console.log(this.volume.slice(indexStart, indexStart + (this.xSize * 4)));
            // console.log(slice);
            // console.log(sliceI);
            slice.set(this.volume.slice(indexStart, indexStart + (this.xSize * 4)) , sliceI);
            sliceI += (this.xSize * 4);
            

        }
            
        // console.log(slice);
        return slice;

    }


    // functions for setting a slice of the volume:
    // basically the direct opposite of the volume<axis>Slice(index) methods
    // we instead want to give it a canvas context and make it store it in the volume

    // takes a Uint8ClampedArray as slice
    volumeSetZSlice(index, slice)
    {
        // pixelArray is a flat 1D uint8Array so it will use this.xSize, this.ySize, this.zSize to determine
        // which pixel belongs in which row, column, slice...

        // cannot do anything if the slice is not within the volume
        if(index < 0) return;
        if(index > this.zSize) return;

        // let sliceSize = this.xSize * this.ySize * 4
        // let slice = new Uint8ClampedArray(sliceSize);
        // console.log(this.volume)
        // slice.set(this.volume.slice(index * sliceSize, (index + 1) * sliceSize));

        let sliceSize = this.xSize * this.ySize * 4;
        this.volume.set(slice, index * sliceSize);

    }

    volumeSetXSlice(index, slice)
    {
        if(index < 0) return;
        if(index > this.xSize) return;  // along x axis



        //for each z index throught the volume and down the image:
        for(let z = 0; z < this.zSize; z++)
        {
            
            //for each row of the volume:
            for(let y = 0; y < this.ySize; y++)
            {

                // the index of the voxel in volume
                let indexOfVolume = (z * this.ySize * this.xSize * 4) + (y * this.xSize * 4) + (index * 4);

                // the index of the pixel in the image slice
                let indexInSlice = (z * this.ySize * 4) + (((this.ySize - 1) * 4) - (y * 4));

                this.volume.set(slice.slice(indexInSlice, indexInSlice + 4), indexOfVolume);
            }

        }
    }

    volumeSetYSlice(index, slice)
    {
        if(index < 0) return;
        if(index > this.ySize) return;  // along y axis

        //let slice = new Uint8ClampedArray(sliceSize);
        // console.log(this.volume)



        // to get the correct pixels we need to iterate over the volume backwards by xSize*4 between to get a slice of y of each row
        // and then do this for each z layer which is xSize*ySize*4 apart
        // slice.set(this.volume.slice(index * sliceSize, (index + 1) * sliceSize));

        for(let z = 0; z < this.zSize; z++) // for every z layer get the column at the y index
        {
            // get a row of the slice at the z index
            let rowOfSlice = slice.slice((z * this.xSize * 4), ((z + 1) * this.xSize * 4));

            // write the row to the volume where z row = z:
            // the starting index where the row should be written to in volume:
            // (z*4*this.ySize*this.xSize) = the size of the z dimension (1st dimension) of the volume array
            let indexStart = (z*4*this.ySize*this.xSize) + (index*4*this.xSize);

            // write the whole row to volume starting at this index
            this.volume.set(rowOfSlice , indexStart);
        }
    }







}


