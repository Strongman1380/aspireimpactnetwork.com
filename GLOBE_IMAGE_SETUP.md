# Globe Image Setup Guide

## How to Add Your Green Globe Image

### Step 1: Save Your Globe Image

1. Save the green globe image you want to use
2. Name it `globe-green.png`
3. Place it in the `images/` folder

### Step 2: Update index.html

Open `index.html` and find this section (around line 127-192):

```html
<div class="hero-globe">
    <!-- Replace this with your actual globe image: <img src="images/globe-green.png" alt="Global Impact Network" class="globe-image"> -->
    <div class="globe-container">
        ...SVG CODE...
    </div>
</div>
```

**Replace it with:**

```html
<div class="hero-globe">
    <img src="images/globe-green.png" alt="Global Impact Network - Transforming Lives Worldwide" class="globe-image">
</div>
```

### Step 3: That's It!

The CSS is already set up to:
- Make the globe glow with green light
- Animate it with a floating effect
- Add drop shadows
- Make it responsive on all devices

---

## Current State

Right now, you have an **animated SVG globe** that:
- ✅ Matches the green tech aesthetic
- ✅ Has glowing effects
- ✅ Animates and pulses
- ✅ Shows connection points
- ✅ Has a rotating outer ring

When you add your actual PNG globe image, it will have the same effects but with your custom design!

---

## Alternative: Keep Both

You can also keep the SVG as a background layer and place your PNG on top:

```html
<div class="hero-globe">
    <div class="globe-container">
        <div class="globe-glow"></div>
        <img src="images/globe-green.png" alt="Global Impact Network" class="globe-image" style="position: absolute;">
        <svg class="globe-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            ...keep the SVG code...
        </svg>
    </div>
</div>
```

This creates a layered effect with both the SVG grid lines and your actual globe image!
