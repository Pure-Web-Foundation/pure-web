import { html } from "lit";
import { PureSPA } from "../../spa";

export class PageMasonry extends PureSPA.Page {
  render(){
    return html`<div class="tiles masonry">
    <div class="item blog">
      <div class="content">
        <div class="title">
          <h3>1: Blog Post</h3>
        </div>
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.</p>
        </div>
      </div>
    </div>
    <div class="item photo">
      <div class="content">
        <div class="title">
          <h3>2: Photo</h3>
        </div>
        <img class="photothumb" src="https://assets.codepen.io/881020/dog1.jpg">
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .</p>
        </div>
      </div>
    </div>
    <div class="item photo">
      <div class="content">
        <div class="title">
          <h3>3: Photo</h3>
        </div>
        <img class="photothumb" src="https://assets.codepen.io/881020/dog2.jpg">
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, conse</p>
        </div>
      </div>
    </div>
    <div class="item project">
      <div class="content">
        <div class="title">
          <h3>4: Project</h3>
        </div>
        <div class="desc">
          <img src="https://assets.codepen.io/881020/dog3.jpg">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.</p>
        </div>
      </div>
    </div>
    <div class="item project">
      <div class="content">
        <div class="title">
          <h3>5: Project</h3>
        </div>
        <div class="desc">
          <img src="https://assets.codepen.io/881020/dog4.jpg">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus </p>
        </div>
      </div>
    </div>
    <div class="item blog">
      <div class="content">
        <div class="title">
          <h3>6: Blog Post</h3>
        </div>
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh</p>
        </div>
      </div>
    </div>
    <div class="item project">
      <div class="content">
        <div class="title">
          <h3>7: Project</h3>
        </div>
        <div class="desc">
          <img src="https://assets.codepen.io/881020/dog5.jpg">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.</p>
        </div>
      </div>
    </div>
    <div class="item blog">
      <div class="content">
        <div class="title">
          <h3>8: Blog Post</h3>
        </div>
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Semper ut risus. </p>
        </div>
      </div>
    </div>
    <div class="item photo">
      <div class="content">
        <div class="title">
          <h3>9: Photo</h3>
        </div>
        <img class="photothumb" src="https://assets.codepen.io/881020/dog2.jpg">
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis</p>
        </div>
      </div>
    </div>
    <div class="item blog">
      <div class="content">
        <div class="title">
          <h3>10: Blog Post</h3>
        </div>
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. </p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. </p>
        </div>
      </div>
    </div>
    <div class="item photo">
      <div class="content">
        <div class="title">
          <h3>11: Photo</h3>
        </div>
        <img class="photothumb" src="https://assets.codepen.io/881020/dog9.jpg">
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,</p>
        </div>
      </div>
    </div>
    <div class="item project">
      <div class="content">
        <div class="title">
          <h3>12: Project</h3>
        </div>
        <div class="desc">
          <img src="https://assets.codepen.io/881020/dog10.jpg">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,</p>
        </div>
      </div>
    </div>
    <div class="item blog">
      <div class="content">
        <div class="title">
          <h3>13: Blog Post</h3>
        </div>
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.</p>
        </div>
      </div>
    </div>
    <div class="item photo">
      <div class="content">
        <div class="title">
          <h3>14: Photo</h3>
        </div>
        <img class="photothumb" src="https://assets.codepen.io/881020/dog1.jpg">
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .</p>
        </div>
      </div>
    </div>
    <div class="item photo">
      <div class="content">
        <div class="title">
          <h3>15: Photo</h3>
        </div>
        <img class="photothumb" src="https://assets.codepen.io/881020/dog2.jpg">
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, conse</p>
        </div>
      </div>
    </div>
    <div class="item project">
      <div class="content">
        <div class="title">
          <h3>16: Project</h3>
        </div>
        <div class="desc">
          <img src="https://assets.codepen.io/881020/dog3.jpg">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.</p>
        </div>
      </div>
    </div>
    <div class="item project">
      <div class="content">
        <div class="title">
          <h3>17: Project</h3>
        </div>
        <div class="desc">
          <img src="https://assets.codepen.io/881020/dog4.jpg">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus </p>
        </div>
      </div>
    </div>
    <div class="item blog">
      <div class="content">
        <div class="title">
          <h3>18: Blog Post</h3>
        </div>
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh</p>
        </div>
      </div>
    </div>
    <div class="item project">
      <div class="content">
        <div class="title">
          <h3>19: Project</h3>
        </div>
        <div class="desc">
          <img src="https://assets.codepen.io/881020/dog10.jpg">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,</p>
        </div>
      </div>
    </div>
    <div class="item blog">
      <div class="content">
        <div class="title">
          <h3>20: Blog Post</h3>
        </div>
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.</p>
        </div>
      </div>
    </div>
    <div class="item photo">
      <div class="content">
        <div class="title">
          <h3>21: Photo</h3>
        </div>
        <img class="photothumb" src="https://assets.codepen.io/881020/dog1.jpg">
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .</p>
        </div>
      </div>
    </div>
    <div class="item photo">
      <div class="content">
        <div class="title">
          <h3>22: Photo</h3>
        </div>
        <img class="photothumb" src="https://assets.codepen.io/881020/dog2.jpg">
        <div class="desc">
          <p>Lorem ipsum dolor sit amet, conse</p>
        </div>
      </div>
    </div>
    <div class="item project">
      <div class="content">
        <div class="title">
          <h3>23: Project</h3>
        </div>
        <div class="desc">
          <img src="https://assets.codepen.io/881020/dog3.jpg">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.</p>
        </div>
      </div>
    </div>
    <div class="item project">
      <div class="content">
        <div class="title">
          <h3>24: Project</h3>
        </div>
        <div class="desc">
          <img src="https://assets.codepen.io/881020/dog4.jpg">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus </p>
        </div>
      </div>
    </div>

  </div>`
  }
}
