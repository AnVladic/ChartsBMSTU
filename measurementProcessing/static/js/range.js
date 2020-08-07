class Range  {
    constructor(parent, func) {
        var circle = parent.getElementsByClassName('circle')
        this.func = func
        
        this.parent = parent
        this.range = parent.querySelector('.range')
        this.left = circle[0]
        this.right = circle[1]

        this.leftWidth 

        this.move(circle[0])
        this.move(circle[1])
        this.moveRang(this.range)
    }

    callFunc() {
        var left = this.left.offsetLeft, right = this.right.offsetLeft
        this.func(left / this.parent.offsetWidth, right / this.parent.offsetWidth)
    }

    move(circle) {
        var self = this
        var parent = this.parent.getBoundingClientRect()

        function set(x) {
            x -= 3
            circle.style.left = x + 'px'
            if (self.left.offsetLeft > self.right.offsetLeft) {
                var a = self.left
                self.left = self.right
                self.right = a
            }
            var left = self.left.offsetLeft, right = self.right.offsetLeft
            self.func(left / self.parent.offsetWidth, right / self.parent.offsetWidth)
            self.range.style.left = left + 'px'
            self.range.style.width = right - left + 'px'
        }

        function move(event) {
            parent = self.parent.getBoundingClientRect()
            if (event.pageX >= parent.x)
                if (event.pageX <= parent.x + parent.width)
                    set(event.pageX - self.leftWidth)
                else
                    set(parent.x + parent.width - self.leftWidth)
            else
                set(parent.x - self.leftWidth)
        }

        circle.onmousedown = function(event) {
            document.addEventListener('mousemove', move)
            self.leftWidth = this.getBoundingClientRect().x - this.offsetLeft
            function remove() {
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', remove)
            }
            document.addEventListener('mouseup', remove)
        }
    }

    moveRang(range) {
        var self = this
        var delta

        function set(x) {
            self.left.style.left = x + 'px'
            self.range.style.left = x + 'px'
            self.right.style.left = x + self.range.offsetWidth + 'px'
            self.func(
                x / self.parent.offsetWidth, 
                (x + self.range.offsetWidth) / self.parent.offsetWidth
            )
        }

        function move(event) {
            var x = event.pageX - self.leftWidth - delta
            if (x >= 0)
                if (x + self.range.offsetWidth <= self.parent.offsetWidth)
                    set(x)
                else
                    set(self.parent.offsetWidth - self.range.offsetWidth)
            else
                set(0)
        }

        range.onmousedown = function(event) {
            document.addEventListener('mousemove', move)
            delta = event.pageX - self.leftWidth - self.range.offsetLeft
            self.leftWidth = this.getBoundingClientRect().x - this.offsetLeft
            function remove() {
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', remove)
            }
            document.addEventListener('mouseup', remove)
        }
    }

    set(x, x1) {
        var left = x * this.parent.offsetWidth, right = x1 * this.parent.offsetWidth
        this.left.style.left = left + 'px'
        this.right.style.left = right + 'px'
        this.range.style.left = left + 'px'
        this.range.style.width = right - left + 'px'
    }
}