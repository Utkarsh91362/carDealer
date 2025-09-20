import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getCarById from '@salesforce/apex/CarDetailController.getCarById';
import getVariantsByCar from '@salesforce/apex/CarDetailController.getVariantsByCar';
import getInventoryByCar from '@salesforce/apex/CarDetailController.getInventoryByCar';

export default class CarDetail extends LightningElement {
    @track car;
    @track inventory = [];
    @track variants = [];
    @track colors = [];
    @track selectedVariantId = null;
    @track selectedColorId = null;
    carId;
    carImageUrl = '';

    // Get carId from URL
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            const carIdFromUrl = currentPageReference.state.c__carId;
            if (carIdFromUrl && carIdFromUrl !== this.carId) this.carId = carIdFromUrl;
        }
    }

    // Fetch car details
    @wire(getCarById, { carId: '$carId' })
    wiredCar({ data }) {
        if (data) this.car = data;
    }

    // Fetch inventory and prepare colors
    @wire(getInventoryByCar, { carId: '$carId' })
    wiredInventory({ data }) {
        if (!data) return;

        this.inventory = data;
        const defaultColor = 'White';

        this.colors = ['Black', 'Brown', 'White'].map((colorName) => {
            const inv = data.find(i => i.Color__c.toLowerCase() === colorName.toLowerCase());
            const colorCode = colorName === 'Black' ? '#000' : colorName === 'Brown' ? '#8B4513' : '#FFF';
            return {
                id: colorName.toLowerCase(),
                name: colorName,
                url: inv ? inv.Color_URL__c : '',
                cssClass: colorName === defaultColor ? 'color-option selected' : 'color-option',
                style: `background-color: ${colorCode}; width: 20px; height: 20px; border-radius: 50%; display: inline-block;`
            };
        });

        this.selectedColorId = defaultColor.toLowerCase();
        const selected = this.colors.find(c => c.id === this.selectedColorId);
        if (selected) this.carImageUrl = selected.url;
    }

    // Fetch variants and prepare buttons
    @wire(getVariantsByCar, { carId: '$carId' })
    wiredVariants({ data }) {
        if (!data) return;

        const firstId = data[0]?.Id;
        this.variants = data.map((v, i) => ({
            ...v,
            name: v.Name,
            price: `₹${v.Price__c}`,
            cssClass: i === 0 ? 'variant-button selected' : 'variant-button'
        }));

        if (firstId) this.selectedVariantId = firstId;
    }

    // Variant button click
    handleVariantClick(event) {
        const variantId = event.currentTarget.dataset.id;
        this.selectedVariantId = variantId;

        this.variants = this.variants.map(v => ({
            ...v,
            cssClass: v.Id === variantId ? 'variant-button selected' : 'variant-button'
        }));

        this.updateCarImage();
    }

    // Color button click
    handleColorClick(event) {
        const colorId = event.currentTarget.dataset.id;
        this.selectedColorId = colorId;

        this.colors = this.colors.map(c => ({
            ...c,
            cssClass: c.id === colorId ? 'color-option selected' : 'color-option'
        }));

        this.updateCarImage();
    }

    // Update car image based on selected color
    updateCarImage() {
    const color = this.colors.find(c => c.id === this.selectedColorId);
    if (!color || !color.url) return;

    const imgEl = this.template.querySelector('.car-image img');
    if (imgEl) {
        // Fade out
        imgEl.classList.add('fade-out');

        setTimeout(() => {
            // Change image src after fade-out
            this.carImageUrl = color.url;
            
            // Fade in
            imgEl.classList.remove('fade-out');
        }, 250); // half of transition duration
    } else {
        // fallback if element not found
        this.carImageUrl = color.url;
    }
}

}
