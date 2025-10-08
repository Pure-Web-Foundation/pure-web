# pure-web/ac 

```js
import { AutoComplete } from "pure-web/ac";
```

```css
@import "<your node modules prefix>/src/scss/autocomplete";
```
...or...
```css
@import "<your node modules prefix>/public/assets/css/autocomplete.css";
```

## Usage

```html
  <!-- Lit code -->
  <input @focus=${e => AutoComplete.attach(e, this.acOptions )}/>
```
... or ...
```js
  const input = document.querySelector("#omnibox");
  input.addEventListener("focus", e=>{
    AutoComplete.attach(e, this.acOptions )
  })
```

```js
  get acOptions() {
    return {
      categories: {
        Menu: {
          // category handling 
        }
      }
    }
  }
```
