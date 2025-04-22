//var volume;

volumeLoaded = false;
myVolume = new Volume();
axialView = new SliceViewer(document.getElementById("viewport1"), "100%", "100%");
coronalView = new SliceViewer(document.getElementById("viewport2"), "100%", "100%");
sagittalView = new SliceViewer(document.getElementById("viewport3"), "100%", "100%");

axialVolumeDrawer = new SliceDrawer(document.getElementById("viewport1"), "100%", "100%");
coronalVolumeDrawer = new SliceDrawer(document.getElementById("viewport2"), "100%", "100%");
sagittalVolumeDrawer = new SliceDrawer(document.getElementById("viewport3"), "100%", "100%");
axialVolumeDrawer.opacity = 50;
coronalVolumeDrawer.opacity = 50;
sagittalVolumeDrawer.opacity = 50;

document.getElementById("fileInput").addEventListener("change", (event) => 
{
    imageStack = event.target.files;
    // console.log(imageStack[0]);


    
    myVolume.load(imageStack).then(() => 
    {
        // when the views are first loaded i fake a wheel event to render them the first time, then after a wheel event rerenders the new slice
        let syntheticEvent = new WheelEvent("wheel", {deltaX: 0, deltaY: 0, bubbles: true, cancelable: true,});
        //myVolume.volumeSlice(0);
        // axialView.setSize(myVolume.xSize, myVolume.ySize, myVolume.zSize);
        axialView.setVolume(myVolume, "z");
        axialView.sliceScroll(syntheticEvent);

        // create a SliceDrawer instance based on the loaded axialView here
        
        // sliceDrawer
        // let axialVolumeDrawer = new SliceDrawer(document.getElementById("viewport1"), "100%", "100%");
        // let axialVolumeDrawingViewer = new SliceViewer(document.getElementById("viewport1"), "100%", "100%");

        // volume is shared between the viewer and the drawer
        let newSegmentation = new Volume();
        // make a blank volume the right size
        newSegmentation.makeBlankVolume(myVolume.xSize, myVolume.ySize, myVolume.zSize);

        // set up the volume drawer and viewer:
        // axialVolumeDrawer.opacity = 50;
        axialVolumeDrawer.setVolume(newSegmentation, "z"); //the volume drawer will be enabled only when an annotation is selected
        axialVolumeDrawer.sliceScroll(syntheticEvent);
        // axialVolumeDrawingViewer.setVolume(newSegmentation, "z");


        // volume drawer for coronal too
        // let coronalVolumeDrawer = new SliceDrawer(document.getElementById("viewport2"), "100%", "100%");
        // coronalVolumeDrawer.opacity = 50;
        coronalVolumeDrawer.setVolume(newSegmentation, "y"); //the volume drawer will be enabled only when an annotation is selected
        coronalVolumeDrawer.sliceScroll(syntheticEvent);

        // volume drawer for sagittal too
        // let sagittalVolumeDrawer = new SliceDrawer(document.getElementById("viewport3"), "100%", "100%");
        // sagittalVolumeDrawer.opacity = 50;
        sagittalVolumeDrawer.setVolume(newSegmentation, "x"); //the volume drawer will be enabled only when an annotation is selected
        sagittalVolumeDrawer.sliceScroll(syntheticEvent);


        //

        //add events for buttons for the views for next previous etc...
        // console.log(document.getElementById("viewport1").parentElement.querySelector(".buttons .next"));
        document.getElementById("viewport1").parentElement.querySelector(".buttons .next").addEventListener("click", (event) => axialView.nextSlice());
        document.getElementById("viewport1").parentElement.querySelector(".buttons .previous").addEventListener("click", (event) => axialView.previousSlice());
        
        document.getElementById("viewport2").parentElement.querySelector(".buttons .next").addEventListener("click", (event) => coronalView.nextSlice());
        document.getElementById("viewport2").parentElement.querySelector(".buttons .previous").addEventListener("click", (event) => coronalView.previousSlice());

        document.getElementById("viewport3").parentElement.querySelector(".buttons .next").addEventListener("click", (event) => sagittalView.nextSlice());
        document.getElementById("viewport3").parentElement.querySelector(".buttons .previous").addEventListener("click", (event) => saggitalView.previousSlice());
        //


        // coronalView.setSize(myVolume.xSize, myVolume.zSize, myVolume.ySize);
        coronalView.setVolume(myVolume, "y");
        coronalView.sliceScroll(syntheticEvent);

        // sagittalView.setSize(myVolume.ySize, myVolume.zSize, myVolume.xSize);
        sagittalView.setVolume(myVolume, "x");
        sagittalView.sliceScroll(syntheticEvent);
        // // console.log(myVolume);
        // makeImage(myVolume, 0);
        // // let canvas = document.createElement('canvas');
        // // canvas.width = myVolume.xSize;
        // // canvas.height = myVolume.ySize;
        

        // // console.log(imgDatas[0]);
        // // console.log(canvas.width);
        // let imgDat = new ImageData(myVolume.slice(0, pixelArrays[0].length), canvas.width, canvas.height);
        
        
        // console.log(imgDat);
        // canvas.getContext('2d').putImageData(imgDat, 0, 0);
        // // be careful it doesnt do anything if the path isnt found
        // // ctx.drawImage(img, 0, 0, img.width, img.height);
        // // console.log(ctx.getImageData(0, 0, img.width, img.height));
        // // pixelArrays.push(ctx.getImageData(0, 0, img.width, img.height).data);

        // canvas.style.width = "100%";
        // canvas.style.height = "100%";
        // document.getElementById("imageDisplay").appendChild(canvas);
        volumeLoaded = true;

    });
    // Volume.load(imageStack);
    // volume = new Volume(imageStack);







    // image_voxel_volume = imagePixels(imageStack)
    // .then((imgDatas) =>
    //     {
           
            
    //         console.log(imgDatas);

    //         let canvas = document.createElement('canvas');
    //         canvas.width = 512;
    //         canvas.height = 512;
            

    //         console.log(imgDatas[0]);
    //         console.log(canvas.width);
    //         let imgDat = new ImageData(imgDatas[0], canvas.width, canvas.height);
            
            
    //         console.log(imgDat)
    //         canvas.getContext('2d').putImageData(imgDat, 0, 0);
    //         // be careful it doesnt do anything if the path isnt found
    //         // ctx.drawImage(img, 0, 0, img.width, img.height);
    //         // console.log(ctx.getImageData(0, 0, img.width, img.height));
    //         // pixelArrays.push(ctx.getImageData(0, 0, img.width, img.height).data);

    //         canvas.style.width = "100%";
    //         canvas.style.height = "100%";
    //         document.getElementById("imageDisplay").appendChild(canvas);

    //     }
    // );
    
                
    // imageStack doesnt have the whole filepath so the loadasvoxelvolume function needs to handle them as files
});



//document.querySelector("#toolbar #pen-size")
//console.log(document.getElementById("pen-size").value);
document.querySelector("#toolbar #pen-size").addEventListener("input", (event) =>
{
    //console.log(event.target);
    axialVolumeDrawer.setLineWidth(event.target.value);
    coronalVolumeDrawer.setLineWidth(event.target.value);
    sagittalVolumeDrawer.setLineWidth(event.target.value);
});

document.querySelector("#toolbar #toggle-pen").className = "toggled";

document.querySelector("#toolbar #toggle-eraser").addEventListener("click", (event) =>
{
    document.querySelector("#toolbar #toggle-eraser").className = "toggled";
    document.querySelector("#toolbar #toggle-pen").className = "";
    console.log("eraser mode");
    axialVolumeDrawer.setEraseMode(true);
    coronalVolumeDrawer.setEraseMode(true);
    sagittalVolumeDrawer.setEraseMode(true);

});

document.querySelector("#toolbar #toggle-pen").addEventListener("click", (event) =>
    {
        document.querySelector("#toolbar #toggle-pen").className = "toggled";
        document.querySelector("#toolbar #toggle-eraser").className = "";
        console.log("pen mode");
        axialVolumeDrawer.setEraseMode(false);
        coronalVolumeDrawer.setEraseMode(false);
        sagittalVolumeDrawer.setEraseMode(false);
    
    });




// function getState()
// {
//     //let volumeLoaded = false;
// // let myVolume;
// // let axialView;
// // let coronalView;
// // let sagittalView;
// // let axialVolumeDrawer;
// // let coronalVolumeDrawer;
// // let sagittalVolumeDrawer;

// // let ANNOTATION_LIST;


// return {
//     annotations: ANNOTATION_LIST.list.map(a => ({
//         note: a.note,
//         origin: a.origin,
//         volumeData: a.volume.data,
//         active: a.active,
//     })),
//     volume: myVolume,
//     axialV: axialView,
//     coronalV: coronalView,
//     sagittalV: saggitalView,
//     axialD: axialVolumeDrawer,
//     coronalD: coronalVolumeDrawer,
//     sagittalD: saggitalVolumeDrawer,

// }
// }


// function setState()
// {
    
// }
