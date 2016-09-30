# Intern Visual Regression Testing

This project adds support for visual regression testing in Intern

## Test a page

```javascript
this.remote()
     .get('http://sitepen.com')
     .setWindowSize(1024, 768)  // set the window size
     .testVisuals({
          tolerance: 0.1,
     })
```

## Test a component

```javascript
this.remote()
     .get('http://sitepen.com')
     .execute(function () {
          // hide variable components
          document.getElementById('currentTime').style.visibility = "hidden";
     })
     .findById('container')  // select a container for test
     .testVisuals({
          name: 'overrides the default image name',
          tolerance: 0.1
     })
```

## Configuration-driven testing

```javascript
this.remote()
     .get('http://sitepen.com')
     .testVisuals({
          name: 'overrides the default image name',
          tolerance: 0.1,
          component: '#container',
          windowSize: { width: 1024, height: 768 },
          hideElements: [
                    '#currentTime'  // visibility: hidden
          ],
          removeElements: [
                    '#footer'  // display: none
          ]
     })
```
