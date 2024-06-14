import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-card-estadistica-prediccion",
  templateUrl: "./card-estadistica-prediccion.component.html",
  styleUrls: ["./card-estadistica-prediccion.component.css"],
})
export class CardEstadisticaPrediccionComponent implements OnInit {
  constructor() {}

  @Input() estadistica: any;

  tags: Array<any> = [
    { label: "Muy alta", severity: "success", icon: "pi pi-angle-double-up" },
    {
      label: "Alta",
      severity: "success",
      icon: "pi pi-angle-up",
    },
    {
      label: "Baja",
      severity: "danger",
      icon: "pi pi-angle-down",
    },
    { label: "Muy baja", severity: "danger", icon: "pi pi-angle-double-down" },
    { label: "Moderada", severity: "warning", icon: "pi pi-minus" },
    { label: "Sin relación", severity: "danger", icon: "pi pi-times" },
    { label: "Sin cupo", severity: "danger", icon: "pi pi-times" },
    { label: "Con cupo", severity: "success", icon: "pi pi-check" },
  ];

  tag: any = null;

  /*
  probabilidad >= 80 muy alta

  probabilidad < 80 && probabilidad >=60  alta

  probabilidad < 60 && probabilidad >=40  baja

  probabilidad < 40 muy baja


  nota >= 6.0 muy alta

  nota < 6.0 && nota >= 5.0 alta

  nota <  5.0 && nota >= 4.0  baja

  nota < 4.0 muy baja


   relacion >= 0.7                      muy alta

   relacion < 0.7 && relacion >= 0.5    alta

   relacion < 0.5 && relacion >= 0.3    moderado

   relacion < 0.3 && relacion >= 0.1    baja
      
  relacion < 0.1                        Sin relacion
      
  */

  ngOnInit(): void {
    if (this.estadistica?.tipo == "probabilidad") {
      if (this.estadistica.valor >= 80) {
        this.tag = this.tags[0];
      }
      if (this.estadistica.valor < 80 && this.estadistica.valor >= 60) {
        this.tag = this.tags[1];
      }
      if (this.estadistica.valor < 60 && this.estadistica.valor >= 40) {
        this.tag = this.tags[2];
      }
      if (this.estadistica.valor < 40) {
        this.tag = this.tags[3];
      }
    } else if (
      this.estadistica?.tipo == "numero" &&
      this.estadistica.nombre != "Cupo asignatura/alumnos inscritos"
    ) {
      if (this.estadistica.valor >= 6) {
        this.tag = this.tags[0];
      }
      if (this.estadistica.valor < 6 && this.estadistica.valor >= 5) {
        this.tag = this.tags[1];
      }
      if (this.estadistica.valor < 5 && this.estadistica.valor >= 4) {
        this.tag = this.tags[2];
      }
      if (this.estadistica.valor < 4) {
        this.tag = this.tags[3];
      }
    } else if (this.estadistica?.tipo == "relacion") {
      let valor = Math.abs(this.estadistica.valor);
      if (valor >= 0.7) {
        this.tag = this.tags[0];
      }
      if (valor < 0.7 && valor >= 0.5) {
        this.tag = this.tags[1];
      }
      if (valor < 0.5 && valor >= 0.3) {
        this.tag = this.tags[4];
      }
      if (valor < 0.3 && valor >= 0.1) {
        this.tag = this.tags[2];
      }
      if (valor < 0.1) {
        this.tag = this.tags[5];
      }
    } else if (this.estadistica.nombre == "Cupo asignatura/alumnos inscritos") {
      if (
        this.estadistica.valor.cantidadAlumnos < this.estadistica.valor.cupo
      ) {
        this.tag = this.tags[7];
      } else {
        this.tag = this.tags[6];
      }
    }
  }
}
