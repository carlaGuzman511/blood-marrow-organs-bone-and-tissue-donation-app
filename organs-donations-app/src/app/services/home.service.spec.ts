import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HomeService } from './home.service';
import { BloodType, Donation, DonationCenter, DonationPost, User } from '../models/DonationPost';

describe('HomeService', () => {
  let service: HomeService;
  let httpMock: HttpTestingController;
  const apiUrl: string = "http://192.168.0.6:7140/api";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HomeService]
    });

    service = TestBed.inject(HomeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should save donation center posts', () => {
    const donationCenterId: string = "30b619f7-b8e6-47a1-b881-5f2141bb7d77";
    const donationPost: DonationPost = {
      id: "b2af0e05-395f-42cb-a264-01556165b4f3",
      bloodType: {
        id: "cfd5a4ed-2c2e-4dbb-8c27-6512bfb1b717",
        name: "B-",
        image: ""
        },
      donationType: {
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
      user: undefined,
      donationCenter: {
        id: "30b619f7-b8e6-47a1-b881-5f2141bb7d77",
        name: "Banco de Sangre Privado Dr. Zuna",
        address: "Ingenio Azucarero Guabirá, Montero km 1½, carretera Montero - Saavedra",
        image: "",
        city: "Santa Cruz - Bolivia",
        latitude: -19.04272304815448,
        longitude: -65.26590967690878,
        donationTypes: [],
      },
      description: "Se necesita donante de corneas",
      image: "",
      createdAt: "2025-07-20T23:49:38.2270586",
      updatedAt: "0001-01-01T00:00:00",
      comments: []
    };

    service.saveDonationCenterPosts(donationCenterId, donationPost).subscribe((donationPost) =>
      {
        expect(donationPost.id).toBe("b2af0e05-395f-42cb-a264-01556165b4f3");
        expect(donationPost.bloodType?.id).toBe("cfd5a4ed-2c2e-4dbb-8c27-6512bfb1b717");
        expect(donationPost.bloodType?.image).toBe("");
        expect(donationPost.bloodType?.name).toBe("B-");
        expect(donationPost.description).toBe("Se necesita donante de corneas");
        expect(donationPost.image).toBe("");
        expect(donationPost.createdAt).toBe("2025-07-20T23:49:38.2270586");
        expect(donationPost.updatedAt).toBe("0001-01-01T00:00:00");
        expect(donationPost.comments?.length).toBe(0);
        expect(donationPost.donationCenter?.address).toBe("Ingenio Azucarero Guabirá, Montero km 1½, carretera Montero - Saavedra");
        expect(donationPost.donationCenter?.city).toBe("Santa Cruz - Bolivia");
        expect(donationPost.donationCenter?.donationTypes?.length).toBe(0);
        expect(donationPost.donationCenter?.id).toBe("30b619f7-b8e6-47a1-b881-5f2141bb7d77");
        expect(donationPost.donationCenter?.image).toBe("");
        expect(donationPost.donationCenter?.latitude).toBe(-19.04272304815448);
        expect(donationPost.donationCenter?.longitude).toBe(-65.26590967690878);
        expect(donationPost.donationCenter?.name).toBe("Banco de Sangre Privado Dr. Zuna");
        expect(donationPost.donationType?.id).toBe("6a2d6f1a-b6f6-4d8e-b0c5-3b3c71e7eab3");
        expect(donationPost.donationType?.name).toBe("Córneas");
        expect(donationPost.donationType?.description).toBe("La donación de córneas es el trasplante más frecuente del mundo. Se realiza post mortem y permite recuperar la visión en personas con enfermedades oculares graves.");
        expect(donationPost.donationType?.requirements).toBe("• Donación post mortem con consentimiento previo o autorización familiar.\\n• Muerte natural o encefálica.\\n• Córneas sanas, sin infecciones ni enfermedades transmisibles.\\n• Extracción dentro de las 6 horas del fallecimiento.");
        expect(donationPost.donationType?.process).toBe("Tras la muerte del donante, se extrae la córnea con cuidado, se conserva en medio especial y se traslada al banco de ojos. Allí se evalúa y se asigna a un receptor compatible.");
        expect(donationPost.donationType?.importance).toBe("Es fundamental para restaurar la visión en pacientes con queratocono, opacidades corneales, traumatismos o enfermedades hereditarias. Aumenta su autonomía e independencia.");
        expect(donationPost.donationType?.benefits).toBe("• Recuperación visual parcial o total.\\n• Mejora en la calidad de vida.\\n• Procedimiento con alta tasa de éxito y baja complejidad quirúrgica.");
        expect(donationPost.donationType?.secondaryEffects).toBe("• Posible rechazo inmunológico.\\n• Infecciones oculares.\\n• Alteraciones visuales temporales postoperatorias.\\n• Necesidad de controles frecuentes.");
        expect(donationPost.donationType?.image).toBe("");
        expect(donationPost.user).toBeUndefined();  
      }
    );
    
    const req = httpMock.expectOne(`${apiUrl}/donation-centers/${donationCenterId}/donation-posts`);
    expect(req.request.body).toEqual(donationPost);
    expect(req.request.method).toBe('POST');
    req.flush(donationPost);
  })

  it('should save user posts', () => {
    
  })

  it('should fetch donation posts', () => {
    const mockDonationPosts: DonationPost[] = [
    {
      id: "b2af0e05-395f-42cb-a264-01556165b4f3",
      bloodType: {
        id: "cfd5a4ed-2c2e-4dbb-8c27-6512bfb1b717",
        name: "B-",
        image: ""
        },
      donationType: {
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
      user: undefined,
      donationCenter: {
        id: "30b619f7-b8e6-47a1-b881-5f2141bb7d77",
        name: "Banco de Sangre Privado Dr. Zuna",
        address: "Ingenio Azucarero Guabirá, Montero km 1½, carretera Montero - Saavedra",
        image: "",
        city: "Santa Cruz - Bolivia",
        latitude: -19.04272304815448,
        longitude: -65.26590967690878,
        donationTypes: [],
      },
      description: "Se necesita donante de corneas",
      image: "",
      createdAt: "2025-07-20T23:49:38.2270586",
      updatedAt: "0001-01-01T00:00:00",
      comments: []
    },
    {
      id: "894b791e-e1d9-4e38-a574-fe64c7a2a8e2",
      bloodType: {
        id: "3b2c65f7-eaa0-40ef-89d9-9a9b21769b89",
        name: "A-",
        image: ""
      },
      donationType: {
        id: "5fbd9af3-9a3e-4f24-b916-cb792c9cb404",
        name: "Médula Ósea",
        description: "La médula ósea es un tejido esponjoso que se encuentra dentro de algunos huesos, como el esternón o la pelvis. Produce células madre hematopoyéticas, que se transforman en:\\n• Glóbulos rojos (transportan oxígeno)\\n• Glóbulos blancos (luchan contra infecciones)\\n• Plaquetas (ayudan a la coagulación)\\n La donación de médula ósea permite extraer células madre hematopoyéticas esenciales para curar enfermedades como la leucemia o linfoma. Puede realizarse por sangre periférica o por punción directa del hueso de la cadera.",
        requirements: "• Edad: 18-40 años.\\n• Buen estado de salud. No tener enfermedades crónicas, autoinmunes, infecciosas, etc.\\n• Registro como donante voluntario.\\n• Peso saludable.\\n• No haber padecido enfermedades graves o inmunológicas.",
        process: "1. Aferesis: Se administra un medicamento durante 4-5 días para movilizar las células madre al torrente sanguíneo. Luego se extraen mediante una máquina especial.\\n2. Extracción directa: Se realiza bajo anestesia general, extrayendo médula del hueso de la cadera mediante punciones. Procedimiento indoloro y seguro.",
        importance: "Es la única opción curativa para muchas enfermedades de la sangre como: leucemia, linfomas, mieloma múltiple, aplasia medular y otras enfermedades graves de la sangre. La compatibilidad entre personas no emparentadas es muy baja, por lo que se necesita una gran cantidad de donantes registrados para aumentar las probabilidades de salvar vidas.",
        benefits: "• Salvar vidas.\\n• Satisfacción personal.\\n• Reforzar la solidaridad y cultura de donación.\\n• No conlleva daño permanente al donante.",
        secondaryEffects: "• Dolor leve en huesos o zona lumbar.\\n• Cansancio o molestias temporales.\\n• Reacciones leves al medicamento movilizador.\\n• Riesgos mínimos asociados a anestesia en el caso de punción.",
        image: ""
        },
        user: undefined,
        donationCenter: {
          id: "a15228f3-e35c-4f61-9b4c-96e2bb5e8226",
          name: "Clínica Los Olivos",
          address: "Av. América esquina Pantaleón Dalence",
          image: "",
          city: "Cochabamba - Bolivia",
          latitude: -17.389090868700983,
          longitude: -66.17972158701106,
          donationTypes: [],
        },
        description: "Se necesita donante de medula osea",
        image: "",
        createdAt: "2025-05-29T01:35:34.1233333",
        updatedAt: "2025-05-29T01:35:34.1233333",
        comments: []
      }
    ];

    service.getDonationPosts().subscribe((donationPosts) => {
      expect(donationPosts.length).toBe(2);

      expect(donationPosts[0].id).toBe("b2af0e05-395f-42cb-a264-01556165b4f3");
      expect(donationPosts[0].bloodType?.id).toBe("cfd5a4ed-2c2e-4dbb-8c27-6512bfb1b717");
      expect(donationPosts[0].bloodType?.image).toBe("");
      expect(donationPosts[0].bloodType?.name).toBe("B-");
      expect(donationPosts[0].description).toBe("Se necesita donante de corneas");
      expect(donationPosts[0].image).toBe("");
      expect(donationPosts[0].createdAt).toBe("2025-07-20T23:49:38.2270586");
      expect(donationPosts[0].updatedAt).toBe("0001-01-01T00:00:00");
      expect(donationPosts[0].comments?.length).toBe(0);
      expect(donationPosts[0].donationCenter?.address).toBe("Ingenio Azucarero Guabirá, Montero km 1½, carretera Montero - Saavedra");
      expect(donationPosts[0].donationCenter?.city).toBe("Santa Cruz - Bolivia");
      expect(donationPosts[0].donationCenter?.donationTypes?.length).toBe(0);
      expect(donationPosts[0].donationCenter?.id).toBe("30b619f7-b8e6-47a1-b881-5f2141bb7d77");
      expect(donationPosts[0].donationCenter?.image).toBe("");
      expect(donationPosts[0].donationCenter?.latitude).toBe(-19.04272304815448);
      expect(donationPosts[0].donationCenter?.longitude).toBe(-65.26590967690878);
      expect(donationPosts[0].donationCenter?.name).toBe("Banco de Sangre Privado Dr. Zuna");
      expect(donationPosts[0].donationType?.id).toBe("6a2d6f1a-b6f6-4d8e-b0c5-3b3c71e7eab3");
      expect(donationPosts[0].donationType?.name).toBe("Córneas");
      expect(donationPosts[0].donationType?.description).toBe("La donación de córneas es el trasplante más frecuente del mundo. Se realiza post mortem y permite recuperar la visión en personas con enfermedades oculares graves.");
      expect(donationPosts[0].donationType?.requirements).toBe("• Donación post mortem con consentimiento previo o autorización familiar.\\n• Muerte natural o encefálica.\\n• Córneas sanas, sin infecciones ni enfermedades transmisibles.\\n• Extracción dentro de las 6 horas del fallecimiento.");
      expect(donationPosts[0].donationType?.process).toBe("Tras la muerte del donante, se extrae la córnea con cuidado, se conserva en medio especial y se traslada al banco de ojos. Allí se evalúa y se asigna a un receptor compatible.");
      expect(donationPosts[0].donationType?.importance).toBe("Es fundamental para restaurar la visión en pacientes con queratocono, opacidades corneales, traumatismos o enfermedades hereditarias. Aumenta su autonomía e independencia.");
      expect(donationPosts[0].donationType?.benefits).toBe("• Recuperación visual parcial o total.\\n• Mejora en la calidad de vida.\\n• Procedimiento con alta tasa de éxito y baja complejidad quirúrgica.");
      expect(donationPosts[0].donationType?.secondaryEffects).toBe("• Posible rechazo inmunológico.\\n• Infecciones oculares.\\n• Alteraciones visuales temporales postoperatorias.\\n• Necesidad de controles frecuentes.");
      expect(donationPosts[0].donationType?.image).toBe("");
      expect(donationPosts[0].user).toBeUndefined();

      expect(donationPosts[1].id).toBe("894b791e-e1d9-4e38-a574-fe64c7a2a8e2");
      expect(donationPosts[1].bloodType?.id).toBe("3b2c65f7-eaa0-40ef-89d9-9a9b21769b89");
      expect(donationPosts[1].bloodType?.image).toBe("");
      expect(donationPosts[1].bloodType?.name).toBe("A-");
      expect(donationPosts[1].description).toBe("Se necesita donante de medula osea");
      expect(donationPosts[1].image).toBe("");
      expect(donationPosts[1].createdAt).toBe("2025-05-29T01:35:34.1233333");
      expect(donationPosts[1].updatedAt).toBe("2025-05-29T01:35:34.1233333");
      expect(donationPosts[1].comments?.length).toBe(0);
      expect(donationPosts[1].donationCenter?.address).toBe("Av. América esquina Pantaleón Dalence");
      expect(donationPosts[1].donationCenter?.city).toBe("Cochabamba - Bolivia");
      expect(donationPosts[1].donationCenter?.donationTypes?.length).toBe(0);
      expect(donationPosts[1].donationCenter?.id).toBe("a15228f3-e35c-4f61-9b4c-96e2bb5e8226");
      expect(donationPosts[1].donationCenter?.image).toBe("");
      expect(donationPosts[1].donationCenter?.latitude).toBe(-17.389090868700983);
      expect(donationPosts[1].donationCenter?.longitude).toBe(-66.17972158701106);
      expect(donationPosts[1].donationCenter?.name).toBe("Clínica Los Olivos");
      expect(donationPosts[1].donationType?.id).toBe("5fbd9af3-9a3e-4f24-b916-cb792c9cb404");
      expect(donationPosts[1].donationType?.name).toBe("Médula Ósea");
      expect(donationPosts[1].donationType?.description).toBe("La médula ósea es un tejido esponjoso que se encuentra dentro de algunos huesos, como el esternón o la pelvis. Produce células madre hematopoyéticas, que se transforman en:\\n• Glóbulos rojos (transportan oxígeno)\\n• Glóbulos blancos (luchan contra infecciones)\\n• Plaquetas (ayudan a la coagulación)\\n La donación de médula ósea permite extraer células madre hematopoyéticas esenciales para curar enfermedades como la leucemia o linfoma. Puede realizarse por sangre periférica o por punción directa del hueso de la cadera.");
      expect(donationPosts[1].donationType?.requirements).toBe("• Edad: 18-40 años.\\n• Buen estado de salud. No tener enfermedades crónicas, autoinmunes, infecciosas, etc.\\n• Registro como donante voluntario.\\n• Peso saludable.\\n• No haber padecido enfermedades graves o inmunológicas.");
      expect(donationPosts[1].donationType?.process).toBe("1. Aferesis: Se administra un medicamento durante 4-5 días para movilizar las células madre al torrente sanguíneo. Luego se extraen mediante una máquina especial.\\n2. Extracción directa: Se realiza bajo anestesia general, extrayendo médula del hueso de la cadera mediante punciones. Procedimiento indoloro y seguro.");
      expect(donationPosts[1].donationType?.importance).toBe("Es la única opción curativa para muchas enfermedades de la sangre como: leucemia, linfomas, mieloma múltiple, aplasia medular y otras enfermedades graves de la sangre. La compatibilidad entre personas no emparentadas es muy baja, por lo que se necesita una gran cantidad de donantes registrados para aumentar las probabilidades de salvar vidas.");
      expect(donationPosts[1].donationType?.benefits).toBe("• Salvar vidas.\\n• Satisfacción personal.\\n• Reforzar la solidaridad y cultura de donación.\\n• No conlleva daño permanente al donante.");
      expect(donationPosts[1].donationType?.secondaryEffects).toBe("• Dolor leve en huesos o zona lumbar.\\n• Cansancio o molestias temporales.\\n• Reacciones leves al medicamento movilizador.\\n• Riesgos mínimos asociados a anestesia en el caso de punción.");
      expect(donationPosts[1].donationType?.image).toBe("");
      expect(donationPosts[1].user).toBeUndefined();
    });

    const req = httpMock.expectOne(`${apiUrl}/donation-posts`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDonationPosts);
  });

  it('should fetch blood types', () => {
    const mockBloodTypes: BloodType[] = [
    {
      id: "cfd5a4ed-2c2e-4dbb-8c27-6512bfb1b717",
      name: "B-",
      image: ""
    },
    {
      id: "3b2c65f7-eaa0-40ef-89d9-9a9b21769b89",
      name: "A-",
      image: ""
    }
  ];

    service.getBloodTypes().subscribe((bloodTypes) => {
      expect(bloodTypes.length).toBe(2);

      expect(bloodTypes[0].id).toBe("cfd5a4ed-2c2e-4dbb-8c27-6512bfb1b717");
      expect(bloodTypes[0].name).toBe("B-");
      expect(bloodTypes[0].image).toBe("");

      expect(bloodTypes[1].id).toBe("3b2c65f7-eaa0-40ef-89d9-9a9b21769b89");
      expect(bloodTypes[1].name).toBe("A-");
      expect(bloodTypes[1].image).toBe("");
    });

    const req = httpMock.expectOne(`${apiUrl}/blood-types`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBloodTypes);
  });

  it('should fetch donation centers', () => {
    const mockDonationCenters: DonationCenter[] = [
    {
      id: "30b619f7-b8e6-47a1-b881-5f2141bb7d77",
      name: "Banco de Sangre Privado Dr. Zuna",
      address: "Ingenio Azucarero Guabirá, Montero km 1½, carretera Montero - Saavedra",
      image: "",
      city: "Santa Cruz - Bolivia",
      latitude: -19.04272304815448,
      longitude: -65.26590967690878,
      donationTypes: [],
    },
    {
      id: "a15228f3-e35c-4f61-9b4c-96e2bb5e8226",
      name: "Clínica Los Olivos",
      address: "Av. América esquina Pantaleón Dalence",
      image: "",
      city: "Cochabamba - Bolivia",
      latitude: -17.389090868700983,
      longitude: -66.17972158701106,
      donationTypes: [],
    },
  ];

    service.getDonationCenters().subscribe((donationCenters) => {
      expect(donationCenters.length).toBe(2);

      expect(donationCenters[0].id).toBe("30b619f7-b8e6-47a1-b881-5f2141bb7d77");
      expect(donationCenters[0].name).toBe("Banco de Sangre Privado Dr. Zuna");
      expect(donationCenters[0].address).toBe("Ingenio Azucarero Guabirá, Montero km 1½, carretera Montero - Saavedra");
      expect(donationCenters[0].image).toBe("");
      expect(donationCenters[0].city).toBe("Santa Cruz - Bolivia");
      expect(donationCenters[0].latitude).toBe(-19.04272304815448);
      expect(donationCenters[0].longitude).toBe(-65.26590967690878);
      expect(donationCenters[0].donationTypes?.length).toBe(0);

      expect(donationCenters[1].id).toBe("a15228f3-e35c-4f61-9b4c-96e2bb5e8226");
      expect(donationCenters[1].name).toBe("Clínica Los Olivos");
      expect(donationCenters[1].address).toBe("Av. América esquina Pantaleón Dalence");
      expect(donationCenters[1].image).toBe("");
      expect(donationCenters[1].city).toBe("Cochabamba - Bolivia");
      expect(donationCenters[1].latitude).toBe(-17.389090868700983);
      expect(donationCenters[1].longitude).toBe(-66.17972158701106);
      expect(donationCenters[1].donationTypes?.length).toBe(0);
    });

    const req = httpMock.expectOne(`${apiUrl}/donation-centers`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDonationCenters);
  });

  it('should fetch users', () => {
    const mockUsers: User[] = [
    {
      id: "a15220f0-e35c-4f61-9b4c-96e2bb5e8226",
      fullName: "Juan Perez Mamani",
      email: "juan.perez@gmail.com",
      bloodTypeId: "a15228f3-e35c-4f61-9b4c-96e2bb5e8116",
      password: "x*.001abc!",
      address: "Av. America Nro. 100",
      phoneNumber: "+59175478526",
      image: "",
      dateOfBirth: "05-11-1998",
      latitude: 1.05,
      longitude: 1.02,
      donationPosts:  []   
    },
    {
      id: "a15220f0-e35c-4f61-9b4c-12e2bb5e8226",
      fullName: "Sonia Morales Huanca",
      email: "sonia.morales@gmail.com",
      bloodTypeId: "a98228f3-e35c-4f61-9b4c-96e2bb5e8116",
      password: "a*.881abc!",
      address: "Av. Petrolera Nro. 100",
      phoneNumber: "+59172278526",
      image: "",
      dateOfBirth: "28-01-1998",
      latitude: 1.08,
      longitude: 1.01,
      donationPosts:  []   
    }];

    service.getUsers().subscribe((users) => {
      expect(users?.length).toBe(2);

      expect(users[0].id).toBe("a15220f0-e35c-4f61-9b4c-96e2bb5e8226");
      expect(users[0].fullName).toBe("Juan Perez Mamani");
      expect(users[0].email).toBe("juan.perez@gmail.com");
      expect(users[0].bloodTypeId).toBe("a15228f3-e35c-4f61-9b4c-96e2bb5e8116");
      expect(users[0].password).toBe("x*.001abc!");
      expect(users[0].address).toBe("Av. America Nro. 100");
      expect(users[0].phoneNumber).toBe("+59175478526");
      expect(users[0].image).toBe("");
      expect(users[0].dateOfBirth).toBe("05-11-1998");
      expect(users[0].latitude).toBe(1.05);
      expect(users[0].longitude).toBe(1.02);
      expect(users[0].donationPosts?.length).toBe(0);

      expect(users[1].id).toBe("a15220f0-e35c-4f61-9b4c-12e2bb5e8226");
      expect(users[1].fullName).toBe("Sonia Morales Huanca");
      expect(users[1].email).toBe("sonia.morales@gmail.com");
      expect(users[1].bloodTypeId).toBe("a98228f3-e35c-4f61-9b4c-96e2bb5e8116");
      expect(users[1].password).toBe("a*.881abc!");
      expect(users[1].address).toBe("Av. Petrolera Nro. 100");
      expect(users[1].phoneNumber).toBe("+59172278526");
      expect(users[1].image).toBe("");
      expect(users[1].dateOfBirth).toBe("28-01-1998");
      expect(users[1].latitude).toBe(1.08);
      expect(users[1].longitude).toBe(1.01);
      expect(users[1].donationPosts?.length).toBe(0);
    });

    const req = httpMock.expectOne(`${apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
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
