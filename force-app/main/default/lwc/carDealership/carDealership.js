import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getCars from '@salesforce/apex/CarController.getCars';

export default class CarDealership extends NavigationMixin(LightningElement) {
    @track cars = [];

    carImages = {
        'Honda City': 'https://www.hondacarindia.com/_next/image?url=https%3A%2F%2Fwww.hondacarindia.com%2Fweb-data%2Fmodels%2F2023%2Fcity5thGen%2FExperience%2FColors%2B%2FColors%2FDesktop%2FAr_Vk_Honda-City_3TX_Front-3-4th-Studio-Shot_Lunar-Silver-Metallic_V2.png&w=1920&q=75',
        'Honda Amaze': 'https://www.hondacarindia.com/_next/image?url=https%3A%2F%2Fwww.hondacarindia.com%2Fweb-data%2Fmodels%2F2024%2FnewAmaze%2Fexterior360Desktop%2FAMAZE_EXT_360_LUNAR_SILVER_METALLIC_V-3__00009%201_chooseCar.png&w=1920&q=75'
    };

    @wire(getCars)
    wiredCars({ data, error }) {
        if (data) {
            this.cars = data.map(car => ({
                id: car.Id,
                name: car.Name,
                image: this.carImages[car.Name] || '',
                description: car.Description__c,
                basePrice: car.Base_Price__c,
                warranty: car.Warranty_Years__c,
                services: car.Services__c
            }));
        } else if (error) {
            console.error('Error fetching cars:', error);
        }
    }

    navigateToCar(event) {
        const carId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/car-detail?c__carId=${carId}`
            }
        });
    }
}
