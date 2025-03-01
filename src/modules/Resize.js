import { BaseModule } from './BaseModule';

export class Resize extends BaseModule {
    onCreate = () => {
        // track resize handles
        this.boxes = [];

        // add 4 resize handles
        this.addBox('nwse-resize'); // top left
        this.addBox('nesw-resize'); // top right
        this.addBox('nwse-resize'); // bottom right
        this.addBox('nesw-resize'); // bottom left

        this.positionBoxes();
    };

    onDestroy = () => {
        // reset drag handle cursors
        this.setCursor('');
    };

    positionBoxes = () => {
        const handleXOffset = `${-parseFloat(this.options.handleStyles.width) / 2}px`;
        const handleYOffset = `${-parseFloat(this.options.handleStyles.height) / 2}px`;

        // set the top and left for each drag handle
        [
            { left: handleXOffset, top: handleYOffset },        // top left
            { right: handleXOffset, top: handleYOffset },       // top right
            { right: handleXOffset, bottom: handleYOffset },    // bottom right
            { left: handleXOffset, bottom: handleYOffset },     // bottom left
        ].forEach((pos, idx) => {
            Object.assign(this.boxes[idx].style, pos);
        });
    };

    addBox = (cursor) => {
        // create div element for resize handle
        const box = document.createElement('div');

        // Star with the specified styles
        Object.assign(box.style, this.options.handleStyles);
        box.style.cursor = cursor;

        // Set the width/height to use 'px'
        box.style.width = `${this.options.handleStyles.width}px`;
        box.style.height = `${this.options.handleStyles.height}px`;

        // listen for mousedown on each box
        box.addEventListener('mousedown', this.handleMousedown, false);
		box.addEventListener('touchstart', this.handleMousedown, false);
        // add drag handle to document
        this.overlay.appendChild(box);
        // keep track of drag handle
        this.boxes.push(box);
    };

    handleMousedown = (evt) => {
		const isTouchEvent = (evt.type === 'touchstart');
        // note which box
        this.dragBox = evt.target;

        // note starting mousedown position
		// Set clientX based on event type

		if (isTouchEvent) {
			this.dragStartX = evt.changedTouches[0].clientX;
		} else {
			this.dragStartX = evt.clientX;
		}

        // store the width before the drag
        this.preDragWidth = this.img.width || this.img.naturalWidth;
        // set the proper cursor everywhere
        this.setCursor(this.dragBox.style.cursor);

		if (isTouchEvent) {
			// listen for movement and touchend
			document.addEventListener('touchmove', this.handleDrag, false);
			document.addEventListener('touchend', this.handleMouseup, false);
		} else {
			// listen for movement and mouseup
			document.addEventListener('mousemove', this.handleDrag, false);
			document.addEventListener('mouseup', this.handleMouseup, false);
		}
    };

    handleMouseup = (evt) => {
		const isTouchEvent = (evt.type === 'touchend');
        // reset cursor everywhere
        this.setCursor('');


		if (isTouchEvent) {
			// stop listening for movement and mouseup
			document.removeEventListener('touchmove', this.handleDrag);
			document.removeEventListener('touchend', this.handleMouseup);
		} else {
			// stop listening for movement and mouseup
			document.removeEventListener('mousemove', this.handleDrag);
        	document.removeEventListener('mouseup', this.handleMouseup);
		}
    };

    handleDrag = (evt) => {
        if (!this.img) {
            // image not set yet
            return;
        }

		// Set clientX based on event type
		let clientX = evt.clientX;

		if (evt.type === 'touchmove') {
			clientX = evt.changedTouches[0].clientX;
		}

        // update image size
        const deltaX = clientX - this.dragStartX;
        if (this.dragBox === this.boxes[0] || this.dragBox === this.boxes[3]) {
            // left-side resize handler; dragging right shrinks image
            this.img.width = Math.round(this.preDragWidth - deltaX);
        } else {
            // right-side resize handler; dragging right enlarges image
            this.img.width = Math.round(this.preDragWidth + deltaX);
        }
        this.requestUpdate();
    };

    setCursor = (value) => {
        [
            document.body,
            this.img,
        ].forEach((el) => {
            el.style.cursor = value;   // eslint-disable-line no-param-reassign
        });
    };
}
