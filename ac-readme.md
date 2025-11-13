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
      // debug: true,
      // iconHandler: (item) => {
      //  return `<my-icon-component name="${item.icon}"></my-icon-component>`
      //},
      categories: {
        Menu: { // You can have multiple autocomplete categories, each with separate handling 
          action: (options) => {
            console.log(options); // what happens when an autocomplete item is clicked/selected (default: text copied to input)
          },
          trigger: (options) => options.search.length > 1, // when is the category's getItems() triggered
          async getItems: (options) => {
            return []; // your results 
          }
        }
      }
    }
  }
```
