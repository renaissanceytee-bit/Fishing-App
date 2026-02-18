# Fishing App - Promotional Website

This is the promotional landing page for the Fishing App. It showcases the app's features, pricing, and provides download links.

## Features

- **Hero Section**: Eye-catching introduction with key statistics
- **Features Showcase**: Highlights all major app capabilities
- **Comparison**: Shows advantages over competitors
- **Pricing**: Clear pricing tiers with feature breakdown
- **Download Section**: Links to web app and mobile downloads
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

## Structure

```
website/
├── index.html      # Main promotional page
└── styles.css      # Styling for the promotional page
```

## Quick Start

### Development

Simply open `index.html` in your browser:

```bash
cd website
open index.html  # macOS
# or
xdg-open index.html  # Linux
# or
start index.html  # Windows
```

### Production

This static website can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop the `website` folder
- **GitHub Pages**: Enable Pages in repository settings
- **AWS S3**: Upload to S3 bucket with static hosting enabled
- **Cloudflare Pages**: Connect repository and deploy

## Customization

### Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #1e90ff;
    --secondary-color: #20c997;
    --dark-color: #2c3e50;
    --light-color: #f8f9fa;
}
```

### Content

Edit the text directly in `index.html`:

- **Hero Section**: Update title, subtitle, and stats
- **Features**: Add/remove feature cards
- **Pricing**: Update pricing tiers and features
- **Footer**: Update links and contact information

## Integration with Main App

The promotional website links to the web app at `../mobile/index.html`. When deploying:

1. Deploy the mobile app (React Native Web version) to `/app`
2. Deploy the promotional website to `/`
3. Update links in the promotional site to point to `/app`

## SEO Optimization

The page includes:

- Semantic HTML5 structure
- Meta description tags
- Proper heading hierarchy
- Mobile-responsive design
- Fast loading (no external dependencies)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT - See main project LICENSE file
