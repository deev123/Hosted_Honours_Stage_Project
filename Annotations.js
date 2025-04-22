

class Annotation
{

    // origin, note, volume
    // origin - a 3d coordinate which sets where the sclices are scrolled to when the annotation is clicked
    // note - the text in the annotation box
    // volume - the volume (highlight) associated with the annotation

    // first step: get annotations to work with origin
    // maybe render an X where the annotation is for this
    // then add a volume and a way to draw into the volume from the views

    constructor()
    {
        //this.note = "hello" + Math.floor(Math.random() * 100);
        this.note = "";
        this.id = 0;
        this.active = false;

        // each annotation has a volume associated with it
        // we are assuming the global volume is already loaded
        // we use the loaded volume to make a blank volume the correct size
        let newSegmentation = new Volume();
        newSegmentation.makeBlankVolume(myVolume.xSize, myVolume.ySize, myVolume.zSize);
        this.volume = newSegmentation;
        
    }

    // assign this annotation to the set VolumeDrawers
    assignToDrawers()
    {
        console.log("assigning drawers");
        // need a synthetic scroll to rerender
        let syntheticEvent = new WheelEvent("wheel", {deltaX: 0, deltaY: 0, bubbles: true, cancelable: true,});
        // use the global Drawers
        //save the current drawing if there is any by fake scroll
        axialVolumeDrawer.sliceScroll(syntheticEvent);
        axialVolumeDrawer.setVolume(this.volume, "z");
        axialVolumeDrawer.sliceScroll(syntheticEvent);

        coronalVolumeDrawer.sliceScroll(syntheticEvent);
        coronalVolumeDrawer.setVolume(this.volume, "y");
        coronalVolumeDrawer.sliceScroll(syntheticEvent);

        coronalVolumeDrawer.sliceScroll(syntheticEvent);
        sagittalVolumeDrawer.setVolume(this.volume, "x");
        sagittalVolumeDrawer.sliceScroll(syntheticEvent);
    }


}

class AnnotationsHolder
{

    // stores a list of annotations
    // handles reordering them etc.
    constructor(id)
    {
        
        this.elementList = document.getElementById(id);
        // the list of annotations
        this.list = [];
        this.update();
        this.currentlySelected = -1;
        

    }

    update()
    {
        this.elementList.innerHTML = "";
        let listElement = document.createElement("div");
        listElement.id = "annotationList";
        
        for(let i = 0; i < this.list.length; i++)
        {

            let annotationElement = document.createElement("div");

            if(this.list[i].active) annotationElement.className = "annotation active";
            else annotationElement.className = "annotation"

            // annotationElement.id = "annotation" + i; // no need for id
            annotationElement.innerHTML = `<div class="buttons">
                        <button onclick="ANNOTATION_LIST.moveUp(${i})">^</button>
                        <button onclick="ANNOTATION_LIST.moveDown(${i})">v</button>
                        <button onclick="ANNOTATION_LIST.delete(${i})">X</button>
                    </div>
                    <textarea class="note" placeholder="Write a note for this region..." onclick="ANNOTATION_LIST.setActive(${i})" onchange="ANNOTATION_LIST.list[${i}].note = this.value">${this.list[i].note}</textarea>
                    `;

                    //todo: need to handle when user changes the note

            listElement.appendChild(annotationElement);
            
        }

        this.elementList.innerHTML = "";
        this.elementList.appendChild(listElement);

        let addButton = document.createElement("button");
        addButton.className = "add-new";
        addButton.addEventListener("click", () => {if(volumeLoaded) {this.add()} else {alert("You must load a volume before adding an annotation")}});
        // addButton.onclick = add();
        addButton.innerHTML = `+`;
        this.elementList.appendChild(addButton);
        // <button class="add-new" onclick="addAnnotation(this.parentElement)">+</button>
        // console.log(this.list);
    }

    setActive(index)
    {
        // console.log("set actiuve");
        for(let i = 0; i < this.list.length; i++)
        {
            this.list[i].active = false;
        }
        this.list[index].active = true;
        this.currentlySelected = index;
        this.update();
        this.list[index].assignToDrawers();

        // set the text area to be focused as it has been redrawn
        setTimeout(() => {
            let focusedTextArea = document.querySelector(".annotation.active textarea");
            focusedTextArea.focus();
            focusedTextArea.selectionStart = focusedTextArea.selectionEnd = focusedTextArea.value.length;

        }, 0);
    }

    add()
    {




        // console.log(this.list);
        this.list.push(new Annotation());
        this.setActive(this.list.length - 1);
        this.update();
    }

    delete(index)
    {
        this.list.splice(index, 1);
        this.update();
    }

    moveUp(index)
    {
        if (index == 0)
        {
            return;
        }
        else
        {
            let temp = this.list[index - 1];
            this.list[index - 1] = this.list[index];
            this.list[index] = temp;
        }
        this.setActive(index - 1);
        this.update();

    }

    moveDown(index)
    {
        if (index == this.list.length - 1)
        {
            return;
        }
        else
        {
            let temp = this.list[index + 1];
            this.list[index + 1] = this.list[index];
            this.list[index] = temp;
        }
        
        this.setActive(index + 1);
        this.update();
    }



}






ANNOTATION_LIST = new AnnotationsHolder("annotationListHolder");