import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getCarById from '@salesforce/apex/CarDetailController.getCarById';
import getVariantsByCar from '@salesforce/apex/CarDetailController.getVariantsByCar';
import getInventoryByCar from '@salesforce/apex/CarDetailController.getInventoryByCar';

export default class CarDetail extends LightningElement {
    @api carId;
    @track car;
    @track variants = [];
    @track inventory = [];
    @track selectedVariantId;
    @track selectedColor;

    carImages = {
        'Honda City': 'https://www.hondacarindia.com/...HondaCity.png',
        'Honda Amaze': 'https://www.hondacarindia.com/...HondaAmaze.png'
    };

    @wire(CurrentPageReference)
    getStateParameters(ref) {
        if (ref?.state?.c__carId) {
            this.carId = ref.state.c__carId;
        }
    }

    @wire(getCarById, { carId: '$carId' })
    wiredCar({ data, error }) {
        if (data) this.car = data;
        else if (error) console.error(error);
    }

    @wire(getVariantsByCar, { carId: '$carId' })
    wiredVariants({ data, error }) {
        if (data) {
            this.variants = data;
            if (data.length > 0) this.selectedVariantId = data[0].Id;
        } else if (error) console.error(error);
    }

    @wire(getInventoryByCar, { carId: '$carId' })
    wiredInventory({ data, error }) {
        if (data) {
            this.inventory = data;
            if (data.length > 0) this.selectedColor = data[0].Color__c;
        } else if (error) console.error(error);
    }

    selectVariant(event) {
        this.selectedVariantId = event.currentTarget.dataset.id;
    }
    selectColor(event) {
        this.selectedColor = event.currentTarget.dataset.color;
    }

    get selectedVariant() {
        return this.variants.find(v => v.Id === this.selectedVariantId) || {};
    }
    get displayedPrice() {
        return this.selectedVariant.Price__c ? `₹${this.selectedVariant.Price__c}` : `₹${this.car?.Base_Price__c}`;
    }
    get availableQuantity() {
        const rec = this.inventory.find(inv => inv.Variant__c === this.selectedVariantId && inv.Color__c === this.selectedColor);
        return rec ? rec.Quantity__c : 0;
    }
    get carImageUrl() {
        return this.carImages[this.car?.Name] || '';
    }
    handleBuy() {
        alert(`Buying ${this.car.Name} - Variant: ${this.selectedVariant.Name}, Color: ${this.selectedColor}`);
    }
}
