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
    @track selectedVariantPrice = '';
    @track selectedVariantQuantity = 0;
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

        if (firstId) {
            this.selectedVariantId = firstId;
            const selected = this.variants.find(v => v.Id === firstId);
            this.selectedVariantPrice = selected ? selected.Price__c : '';
            const inventoryItem = this.inventory.find(i => i.Variant__c === firstId && i.Color__c.toLowerCase() === this.selectedColorId);
            this.selectedVariantQuantity = inventoryItem ? inventoryItem.Quantity__c : 0;
        }
    }

    // Variant button click
    handleVariantClick(event) {
        const variantId = event.currentTarget.dataset.id;
        this.selectedVariantId = variantId;

        this.variants = this.variants.map(v => ({
            ...v,
            cssClass: v.Id === variantId ? 'variant-button selected' : 'variant-button'
        }));

        const selected = this.variants.find(v => v.Id === variantId);
        if (selected) {
            this.selectedVariantPrice = selected.Price__c;
            const inventoryItem = this.inventory.find(i => i.Variant__c === variantId && i.Color__c.toLowerCase() === this.selectedColorId);
            this.selectedVariantQuantity = inventoryItem ? inventoryItem.Quantity__c : 0;
        }

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

        // Update quantity in footer for this color-variant combination
        const inventoryItem = this.inventory.find(i => i.Variant__c === this.selectedVariantId && i.Color__c.toLowerCase() === colorId);
        this.selectedVariantQuantity = inventoryItem ? inventoryItem.Quantity__c : 0;

        this.updateCarImage();
    }

    // Update car image based on selected color
    updateCarImage() {
        const color = this.colors.find(c => c.id === this.selectedColorId);
        if (!color || !color.url) return;

        const imgEl = this.template.querySelector('.car-image img');
        if (imgEl) {
            imgEl.classList.add('fade-out');

            setTimeout(() => {
                this.carImageUrl = color.url;
                imgEl.classList.remove('fade-out');
            }, 250);
        } else {
            this.carImageUrl = color.url;
        }
    }
}
