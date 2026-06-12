import { CtaBanner, ContactForm, FeaturesGrid, Footer, Hero, ImageGallery, Testimonials, TextBlock, } from './components';
import { CtaBannerEditorPanel, ContactFormEditorPanel, FeaturesGridEditorPanel, FooterEditorPanel, HeroEditorPanel, ImageGalleryEditorPanel, TestimonialsEditorPanel, TextBlockEditorPanel, } from './editor-panels';
import { contactFormDefaultProps, contactFormSchema, ctaBannerDefaultProps, ctaBannerSchema, featuresGridDefaultProps, featuresGridSchema, footerDefaultProps, footerSchema, heroDefaultProps, heroSchema, imageGalleryDefaultProps, imageGallerySchema, testimonialsDefaultProps, testimonialsSchema, textBlockDefaultProps, textBlockSchema, } from './schemas';
export const componentRegistry = {
    hero: {
        type: 'hero',
        label: 'Hero',
        icon: 'LayoutTemplate',
        category: 'Layout',
        schema: heroSchema,
        defaultProps: heroDefaultProps,
        Component: Hero,
        EditorPanel: HeroEditorPanel,
    },
    'text-block': {
        type: 'text-block',
        label: 'Text block',
        icon: 'AlignLeft',
        category: 'Content',
        schema: textBlockSchema,
        defaultProps: textBlockDefaultProps,
        Component: TextBlock,
        EditorPanel: TextBlockEditorPanel,
    },
    'features-grid': {
        type: 'features-grid',
        label: 'Features grid',
        icon: 'Grid3x3',
        category: 'Content',
        schema: featuresGridSchema,
        defaultProps: featuresGridDefaultProps,
        Component: FeaturesGrid,
        EditorPanel: FeaturesGridEditorPanel,
    },
    'contact-form': {
        type: 'contact-form',
        label: 'Contact form',
        icon: 'Mail',
        category: 'Forms',
        schema: contactFormSchema,
        defaultProps: contactFormDefaultProps,
        Component: ContactForm,
        EditorPanel: ContactFormEditorPanel,
    },
    'image-gallery': {
        type: 'image-gallery',
        label: 'Image gallery',
        icon: 'Images',
        category: 'Media',
        schema: imageGallerySchema,
        defaultProps: imageGalleryDefaultProps,
        Component: ImageGallery,
        EditorPanel: ImageGalleryEditorPanel,
    },
    testimonials: {
        type: 'testimonials',
        label: 'Testimonials',
        icon: 'Quote',
        category: 'Content',
        schema: testimonialsSchema,
        defaultProps: testimonialsDefaultProps,
        Component: Testimonials,
        EditorPanel: TestimonialsEditorPanel,
    },
    'cta-banner': {
        type: 'cta-banner',
        label: 'CTA banner',
        icon: 'Megaphone',
        category: 'Layout',
        schema: ctaBannerSchema,
        defaultProps: ctaBannerDefaultProps,
        Component: CtaBanner,
        EditorPanel: CtaBannerEditorPanel,
    },
    footer: {
        type: 'footer',
        label: 'Footer',
        icon: 'PanelBottom',
        category: 'Layout',
        schema: footerSchema,
        defaultProps: footerDefaultProps,
        Component: Footer,
        EditorPanel: FooterEditorPanel,
    },
};
export function getComponentDefinition(type) {
    return componentRegistry[type];
}
export function isRegisteredComponentType(type) {
    return type in componentRegistry;
}
