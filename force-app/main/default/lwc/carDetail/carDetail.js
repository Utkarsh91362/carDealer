import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getCarById from '@salesforce/apex/CarDetailController.getCarById';
import getVariantsByCar from '@salesforce/apex/CarDetailController.getVariantsByCar';
import getInventoryByCar from '@salesforce/apex/CarDetailController.getInventoryByCar';

export default class CarDetail extends LightningElement {
    @track car;
    @track inventory = [];
    @track variants = [];
    @track selectedVariantId = null;

    carId; // from URL
    carImageUrl = '';

    // Get carId from URL
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            const carIdFromUrl = currentPageReference.state.c__carId;
            if (carIdFromUrl && carIdFromUrl !== this.carId) {
                this.carId = carIdFromUrl;
            }
        }
    }

    // Fetch car details
    @wire(getCarById, { carId: '$carId' })
    wiredCar({ data, error }) {
        if (data) {
            this.car = data;
        } else if (error) {
            console.error('Error fetching car:', error);
        }
    }

    // Fetch inventory to get default color image
    @wire(getInventoryByCar, { carId: '$carId' })
    wiredInventory({ data, error }) {
        if (data) {
            this.inventory = data;
            const whiteInventory = data.find(inv => inv.Color__c === 'White');
            if (whiteInventory) {
                this.carImageUrl = whiteInventory.Color_URL__c;
            }
        } else if (error) {
            console.error('Error fetching inventory:', error);
        }
    }

    // Fetch variants for the car
    @wire(getVariantsByCar, { carId: '$carId' })
    wiredVariants({ data, error }) {
        if (data) {
            this.variants = data.map((v, index) => ({
                ...v,
                name: v.Name,
                price: `₹${v.Price__c}`,
                cssClass: index === 0 ? 'variant-button selected' : 'variant-button'
            }));

            if (data.length > 0) {
                this.selectedVariantId = data[0].Id;
            }
        } else if (error) {
            console.error('Error fetching variants:', error);
        }
    }

    // Handle clicking a variant button
    handleVariantClick(event) {
        const variantId = event.currentTarget.dataset.id;
        this.selectedVariantId = variantId;

        this.variants = this.variants.map(v => ({
            ...v,
            cssClass: v.Id === variantId ? 'variant-button selected' : 'variant-button'
        }));
    }
}
