import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InformationService } from './information.service';
import { Donation } from '../models/DonationPost';

describe('InformationService', () => {
  let service: InformationService;
  let httpMock: HttpTestingController;
  const apiUrl: string = "http://192.168.0.6:7140/api";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InformationService]
    });

    service = TestBed.inject(InformationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch donation types, 200', () => {
    const mockDonationTypes: Donation[] = [
    {
      id: "6a2d6f1a-b6f6-4d8e-b0c5-3b3c71e7eab3",
      name: "Córneas",
      description: "La donación de córneas es el trasplante más frecuente del mundo. Se realiza post mortem y permite recuperar la visión en personas con enfermedades oculares graves.",
      requirements: "• Donación post mortem con consentimiento previo o autorización familiar.\\n• Muerte natural o encefálica.\\n• Córneas sanas, sin infecciones ni enfermedades transmisibles.\\n• Extracción dentro de las 6 horas del fallecimiento.",
      process: "Tras la muerte del donante, se extrae la córnea con cuidado, se conserva en medio especial y se traslada al banco de ojos. Allí se evalúa y se asigna a un receptor compatible.",
      importance: "Es fundamental para restaurar la visión en pacientes con queratocono, opacidades corneales, traumatismos o enfermedades hereditarias. Aumenta su autonomía e independencia.",
      benefits: "• Recuperación visual parcial o total.\\n• Mejora en la calidad de vida.\\n• Procedimiento con alta tasa de éxito y baja complejidad quirúrgica.",
      secondaryEffects: "• Posible rechazo inmunológico.\\n• Infecciones oculares.\\n• Alteraciones visuales temporales postoperatorias.\\n• Necesidad de controles frecuentes.",
      image: ""
    }, 
    {
      id: "5fbd9af3-9a3e-4f24-b916-cb792c9cb404",
      name: "Médula Ósea",
      description: "La médula ósea es un tejido esponjoso que se encuentra dentro de algunos huesos, como el esternón o la pelvis. Produce células madre hematopoyéticas, que se transforman en:\\n• Glóbulos rojos (transportan oxígeno)\\n• Glóbulos blancos (luchan contra infecciones)\\n• Plaquetas (ayudan a la coagulación)\\n La donación de médula ósea permite extraer células madre hematopoyéticas esenciales para curar enfermedades como la leucemia o linfoma. Puede realizarse por sangre periférica o por punción directa del hueso de la cadera.",
      requirements: "• Edad: 18-40 años.\\n• Buen estado de salud. No tener enfermedades crónicas, autoinmunes, infecciosas, etc.\\n• Registro como donante voluntario.\\n• Peso saludable.\\n• No haber padecido enfermedades graves o inmunológicas.",
      process: "1. Aferesis: Se administra un medicamento durante 4-5 días para movilizar las células madre al torrente sanguíneo. Luego se extraen mediante una máquina especial.\\n2. Extracción directa: Se realiza bajo anestesia general, extrayendo médula del hueso de la cadera mediante punciones. Procedimiento indoloro y seguro.",
      importance: "Es la única opción curativa para muchas enfermedades de la sangre como: leucemia, linfomas, mieloma múltiple, aplasia medular y otras enfermedades graves de la sangre. La compatibilidad entre personas no emparentadas es muy baja, por lo que se necesita una gran cantidad de donantes registrados para aumentar las probabilidades de salvar vidas.",
      benefits: "• Salvar vidas.\\n• Satisfacción personal.\\n• Reforzar la solidaridad y cultura de donación.\\n• No conlleva daño permanente al donante.",
      secondaryEffects: "• Dolor leve en huesos o zona lumbar.\\n• Cansancio o molestias temporales.\\n• Reacciones leves al medicamento movilizador.\\n• Riesgos mínimos asociados a anestesia en el caso de punción.",
      image: ""
    }];

    service.getDonationTypes().subscribe((donationTypes) => {
      expect(donationTypes.length).toBe(2);

      expect(donationTypes[0].id).toBe("6a2d6f1a-b6f6-4d8e-b0c5-3b3c71e7eab3");
      expect(donationTypes[0].name).toBe("Córneas");
      expect(donationTypes[0].description).toBe("La donación de córneas es el trasplante más frecuente del mundo. Se realiza post mortem y permite recuperar la visión en personas con enfermedades oculares graves.");
      expect(donationTypes[0].requirements).toBe("• Donación post mortem con consentimiento previo o autorización familiar.\\n• Muerte natural o encefálica.\\n• Córneas sanas, sin infecciones ni enfermedades transmisibles.\\n• Extracción dentro de las 6 horas del fallecimiento.");
      expect(donationTypes[0].process).toBe("Tras la muerte del donante, se extrae la córnea con cuidado, se conserva en medio especial y se traslada al banco de ojos. Allí se evalúa y se asigna a un receptor compatible.");
      expect(donationTypes[0].importance).toBe("Es fundamental para restaurar la visión en pacientes con queratocono, opacidades corneales, traumatismos o enfermedades hereditarias. Aumenta su autonomía e independencia.");
      expect(donationTypes[0].benefits).toBe("• Recuperación visual parcial o total.\\n• Mejora en la calidad de vida.\\n• Procedimiento con alta tasa de éxito y baja complejidad quirúrgica.");
      expect(donationTypes[0].secondaryEffects).toBe("• Posible rechazo inmunológico.\\n• Infecciones oculares.\\n• Alteraciones visuales temporales postoperatorias.\\n• Necesidad de controles frecuentes.");
      expect(donationTypes[0].image).toBe("");

      expect(donationTypes[1].id).toBe("5fbd9af3-9a3e-4f24-b916-cb792c9cb404");
      expect(donationTypes[1].name).toBe("Médula Ósea");
      expect(donationTypes[1].description).toBe("La médula ósea es un tejido esponjoso que se encuentra dentro de algunos huesos, como el esternón o la pelvis. Produce células madre hematopoyéticas, que se transforman en:\\n• Glóbulos rojos (transportan oxígeno)\\n• Glóbulos blancos (luchan contra infecciones)\\n• Plaquetas (ayudan a la coagulación)\\n La donación de médula ósea permite extraer células madre hematopoyéticas esenciales para curar enfermedades como la leucemia o linfoma. Puede realizarse por sangre periférica o por punción directa del hueso de la cadera.");
      expect(donationTypes[1].requirements).toBe("• Edad: 18-40 años.\\n• Buen estado de salud. No tener enfermedades crónicas, autoinmunes, infecciosas, etc.\\n• Registro como donante voluntario.\\n• Peso saludable.\\n• No haber padecido enfermedades graves o inmunológicas.");
      expect(donationTypes[1].process).toBe("1. Aferesis: Se administra un medicamento durante 4-5 días para movilizar las células madre al torrente sanguíneo. Luego se extraen mediante una máquina especial.\\n2. Extracción directa: Se realiza bajo anestesia general, extrayendo médula del hueso de la cadera mediante punciones. Procedimiento indoloro y seguro.");
      expect(donationTypes[1].importance).toBe("Es la única opción curativa para muchas enfermedades de la sangre como: leucemia, linfomas, mieloma múltiple, aplasia medular y otras enfermedades graves de la sangre. La compatibilidad entre personas no emparentadas es muy baja, por lo que se necesita una gran cantidad de donantes registrados para aumentar las probabilidades de salvar vidas.");
      expect(donationTypes[1].benefits).toBe("• Salvar vidas.\\n• Satisfacción personal.\\n• Reforzar la solidaridad y cultura de donación.\\n• No conlleva daño permanente al donante.");
      expect(donationTypes[1].secondaryEffects).toBe("• Dolor leve en huesos o zona lumbar.\\n• Cansancio o molestias temporales.\\n• Reacciones leves al medicamento movilizador.\\n• Riesgos mínimos asociados a anestesia en el caso de punción.");
      expect(donationTypes[1].image).toBe("");
    });

    const req = httpMock.expectOne(`${apiUrl}/donation-types`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDonationTypes);
  });

  it('should fetch donation types, 500', () => {
    service.getDonationTypes().subscribe({
    });

    const req = httpMock.expectOne(`${apiUrl}/donation-types`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDonationTypes);
  });

});
