import { YSCollection } from '../core/collection.js'

YSCollection.prototype.show = function () {

    return this.each(el => {
        el.style.display = '';
    })
}

YSCollection.prototype.hide = function () {

    return this.each(el => {
        el.style.display = 'none';
    })
}

YSCollection.prototype.toggle = function () {

    return this.each(el => {
        if (getComputedStyle(el).display === 'none') {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    })
}

// fadeIn(), fadeOut(), fadeToggle() can be implemented using CSS transitions and JavaScript, but they are not included here for simplicity.
YSCollection.prototype.fadeIn = function (duration = 300) {
    return this.each(el => {
        el.style.opacity = 0;
        el.style.display = '';
        
        let start = performance.now();
        function animate(time) {
            // let elapsed = time - start;
            // el.style.opacity = Math.min(elapsed / duration, 1);
            // if (elapsed < duration) {
            //     requestAnimationFrame(animate);
            // }

            const progress = Math.min((time - start) / duration, 1);
            el.style.opacity = progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    });
}

YSCollection.prototype.fadeOut = function (duration = 300) {
    return this.each(el => {
        let start = performance.now();
        function animate(time) {
            const progress = Math.min((time - start) / duration, 1);
            el.style.opacity = 1 - progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                el.style.display = 'none';
            }
        }
        requestAnimationFrame(animate);
    });
}

YSCollection.prototype.fadeToggle = function (duration = 300) {
    return this.each(el => {
        if (getComputedStyle(el).opacity == 0 || getComputedStyle(el).display == 'none') {
            el.style.display = '';
            let start = performance.now();
            function animate(time) {
                const progress = Math.min((time - start) / duration, 1);
                el.style.opacity = progress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
            requestAnimationFrame(animate);
        } else {
            let start = performance.now();
            function animate(time) {
                const progress = Math.min((time - start) / duration, 1);
                el.style.opacity = 1 - progress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.style.display = 'none';
                }
            }
            requestAnimationFrame(animate);
        }
    });
}

