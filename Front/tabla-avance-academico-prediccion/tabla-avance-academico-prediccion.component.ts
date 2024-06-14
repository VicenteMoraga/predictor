import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";

@Component({
  selector: "app-tabla-avance-academico-prediccion",
  templateUrl: "./tabla-avance-academico-prediccion.component.html",
  styleUrls: ["./tabla-avance-academico-prediccion.component.css"],
})
export class TablaAvanceAcademicoPrediccionComponent implements OnInit {
  constructor() {}

  @ViewChild("dt1") table1!: ElementRef<HTMLTableElement>;
  @ViewChild("dt2") table2!: ElementRef<HTMLTableElement>;

  @Input() resumenAvanceSemestres: any;

  documentStyle = getComputedStyle(document.documentElement);

  leyendaItems = [
    {
      value: "Cursando",
      color: "amarillo",
    },
    {
      value: "Aprobada",
      color: "verde",
    },
    {
      value: "Reprobada",
      color: "rojo",
    },

    {
      value: "Sin cursar",
      color: "gris",
    },
  ];

  ngOnInit(): void {}

  clearTable(table) {
    table.clear();
    table.sortField = "id";
    if (table == this.table1) {
      table.sortOrder = -1;
    } else {
      table.sortOrder = 1;
    }

    table.sortSingle();
  }
}
