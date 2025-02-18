---
title: "How to Create Scrollytelling Articles"
date: "9999-01-01"
author: "Tech Team"
excerpt: "A guide to creating articles with scrollytelling features"
coverImage: "images/0.png"
tags: ["guide", "scrollytelling", "tutorial", "test"]
---

# Creating Articles with Scrollytelling

This guide explains how to create articles that include scrollytelling - a storytelling technique where content changes as the reader scrolls through the article.

## Basic Structure

Each scrollytelling article consists of two files that must be placed in the same directory:
1. `index.md` - the main article content with Markdown formatting
2. `scrollytelling.yaml` - configuration for the scrollytelling section

## Adding Scrollytelling to Your Article

To include a scrollytelling section in your article, add this line to your markdown:

```
<ScrollyTelling yamlFile="scrollytelling.yaml" />
```

The scrollytelling section will appear exactly where you place this line. You can have normal text before and after it.

## The YAML Configuration

Below is an example of a scrollytelling.yaml file with explanations of each part:

<ScrollyTelling yamlFile="scrollytelling.yaml" />

## Example scrollytelling.yaml Configuration

Here's the complete YAML configuration used in the example above:

```yaml
# Which side should the text appear on? 
# Options: 'left' or 'right'
textAlignment: right

# Default content shown before scrolling starts
defaultContent:
  type: image
  src: images/0.png
  bgColor: '#e2e2ff'

# Each step in the scrollytelling
steps:
  - text: >-
      1: To have clear beginning of 
      the scrollytelling narrative, 
      use the same image for default
      content and the first step.<br/>
    content:
      type: image
      src: images/1.png
    bgColor: '#ffe7eb'

  - text: |
      2: Here's how you can add
      <span style="background-color: #ffeb3b; padding: 0 4px;">
      highlighted text</span> 
      to emphasize important points in your narrative.
      Just use HTML tags in the text.<br/>
    content:
      type: image
      src: images/2.png
    bgColor: '#e2ffe2'

  - text: |
      3: This demonstrates embedding interactive content.
      In this case, we're using a Flourish visualization.
    content:
      type: iframe
      src: https://flo.uri.sh/visualisation/20114452/embed
      width: 100%
      height: 600px
      allowFullScreen: true
    bgColor: '#e2e2ff'

  - text: |
      4: Notice how smoothly we transition
      back to a static image from 
      the interactive content.<br/>
      <p>Remember, you can use any 
      HTML tags in the text. 
      We used &lt;p&gt; &lt;strong&gt; 
      <strong>to make paragraphs 
      and bold text</strong> &lt;/strong&gt; &lt;/p&gt; 
      in this case.</p>
    content:
      type: image
      src: images/4.png
    bgColor: '#abffab'

  - text: |
      5: We're using the same image 
      as the previous step
      to provide a clean, stable 
      ending to our scrollytelling narrative.
    content:
      type: image
      src: images/4.png 
```

## Key Points to Remember

1. **Content Types**
   - Images: Use `type: image` and provide the path in `src`
   - Iframes: Use `type: iframe` and provide the embed URL in `src`

2. **Text Formatting**
   - You can use HTML in your text for styling
   - Use `>-` or `|` to format multi-line text, but it does affect the resulting HTML
   - bgColors are optional and can be any valid color code (#RRGGBB), if none is provided, the default is transparent

3. **File Organization**
   - Keep images in the `images` folder within your article directory
   - The YAML file does not have to be named `scrollytelling.yaml`, but it must have the same name in the markdown
   - There can be more than one scrollytelling section in an article
   - Both files must be in the same directory as your article

4. **Best Practices**
   - Always provide a default image/content
   - Use consistent image dimensions throughout your story
   - Test your iframe content to ensure it works properly
   - Consider repeating the final image for a clean ending
   - Use background colors that complement your content

## Getting Help

If you encounter any issues or need assistance, contact the tech team for support 🤗