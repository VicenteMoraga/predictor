import { Component, Input, OnInit } from "@angular/core";
@Component({
  selector: "app-grafico-semestre-prediccion",
  templateUrl: "./grafico-semestre-prediccion.component.html",
  styleUrls: ["./grafico-semestre-prediccion.component.css"],
})
export class GraficoSemestrePrediccionComponent implements OnInit {
  constructor() {}

  @Input() resumenAvanceSemestre: any;

  asignaturasSemestre: Array<any>;

  graficoHeight: any;

  data: any;

  options: any;

  options2: any;

  ngOnInit(): void {
    if (this.resumenAvanceSemestre.asignaturasTotal != 0) {
      this.asignaturasSemestre = this.resumenAvanceSemestre.asignaturas;
    }

    const documentStyle = getComputedStyle(document.documentElement);

    if (
      this.resumenAvanceSemestre.asignaturasAprobadas == 0 &&
      this.resumenAvanceSemestre.asignaturasReprobadas == 0
    ) {
      if (this.resumenAvanceSemestre.semestreCursado) {
        const colorCursando = documentStyle.getPropertyValue("--yellow-300");
        const colorHoverCursando =
          documentStyle.getPropertyValue("--yellow-100");
        this.data = {
          labels: ["Cursando"],
          datasets: [
            {
              data: [this.resumenAvanceSemestre.asignaturasTotal],
              backgroundColor: [colorCursando],
              hoverBackgroundColor: [colorHoverCursando],
            },
          ],
        };
      } else {
        this.data = {
          labels: ["No cursado"],
          datasets: [
            {
              data: [1],
              backgroundColor: [
                documentStyle.getPropertyValue("--gray-300"),
                "#ffffff",
              ],
              hoverBackgroundColor: [
                documentStyle.getPropertyValue("--gray-700"),
                "#ffffff",
              ],
            },
          ],
        };
      }
    } else {
      const colorAprobar = documentStyle.getPropertyValue("--green-300");
      const colorHoverAprobar = documentStyle.getPropertyValue("--green-100");
      const colorReprobar = documentStyle.getPropertyValue("--red-300");
      const colorHoverReprobar = documentStyle.getPropertyValue("--red-100");
      this.data = {
        labels: ["Reprobadas", "Aprobadas"],
        datasets: [
          {
            data: [
              this.resumenAvanceSemestre.asignaturasReprobadas,
              this.resumenAvanceSemestre.asignaturasAprobadas,
            ],
            backgroundColor: [colorReprobar, colorAprobar],
            hoverBackgroundColor: [colorHoverReprobar, colorHoverAprobar],
          },
        ],
      };
    }

    this.options = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
          labels: {
            font: {
              size: 10,
            },
          },
        },
      },
    };

    this.options2 = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      hover: {
        mode: null,
      },
    };
  }
}
