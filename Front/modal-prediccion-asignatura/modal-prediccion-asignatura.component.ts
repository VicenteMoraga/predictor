import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { SystemService } from "...";
import { ErroresHandler } from "...";
import { Alumno } from "...";
import { DatosGeneralesService } from "...";
import { SolicitudesService } from "...";
import { DateUtils } from "...";
@Component({
  selector: "app-modal-prediccion-asignatura",
  templateUrl: "./modal-prediccion-asignatura.component.html",
  styleUrls: ["./modal-prediccion-asignatura.component.css"],
})
export class ModalPrediccionAsignaturaComponent implements OnInit {
  constructor(
    private datosGeneralesService: DatosGeneralesService,
    private solicitudesService: SolicitudesService,
    private systemService: SystemService,
    private erroresHandler: ErroresHandler,
    private dateUtils: DateUtils
  ) {}

  @Input() asignatura: any;
  @Input() alumno: Alumno;
  @Input() inscripcionFinal: any;
  @Output() onCerrar = new EventEmitter<any>();

  displayModal: boolean = true;

  anhoIngreso: any = null;
  avanceAcademico: any;
  estadisticasPrediccion: any;

  prediccion: any;
  prediccionLista: boolean;

  permiteChoque: boolean = false;
  cantSemestres: number = 0;
  asignaturasTope: any;

  mostrarAvanceCurricular: boolean = false;

  anios = [];

  resumenAvance: any;

  ngOnInit(): void {
    this.prediccionLista = false;
    this.anhoIngreso = this.dateUtils
      .numberToDate(this.alumno.fechaIngreso)
      .getFullYear();

    this.getPrediccionAsignatura();
  }

  async getPrediccionAsignatura() {
    this.systemService.setLoading(true);
    await this.getChoqueHorario();
    await this.getPermiteChoque();
    await this.getAvanceAcademicoPrediccion({
      rut: this.alumno.rut,
      codigoProgrma: this.alumno.codigoInterno,
    });
    let paramsPrueba = {
      prueba: true,
      alumno: this.alumno,
      anios: this.avanceAcademico.aniosCursados,
      resumenAvance: this.avanceAcademico.resumenAvance.filter(
        (e) => e.asignaturasTotal > 0 && e.porcentajeAprobacion != -1
      ),
    };
    console.log(this.asignatura);

    let params = {
      prueba: false,
      alumno: this.alumno,
      datosAsignatura: {
        codAsignatura: this.asignatura.codigoAsignatura,
        prerrequisitos: this.asignatura.prerrequisitos,
        permiteChoque: this.permiteChoque,
        asignaturasTope: this.asignaturasTope,
        cupo: this.asignatura.cupo,
        cantidadAlumnos: this.asignatura.cantidadAlumnos,
      },

      anios: this.avanceAcademico.aniosCursados,
      resumenAvance: this.avanceAcademico.resumenAvance.filter(
        (e) => e.asignaturasTotal > 0 && e.porcentajeAprobacion != -1
      ),
      ultimoSemestreCursado: this.avanceAcademico.resumenAvance.filter(
        (e) =>
          e.periodo == this.alumno.ultimoPeriodoCarrera &&
          e.semestre == this.alumno.ultimoSemestreCarrera
      ),
    };

    console.log("datos enviados para prediccion", params);

    try {
      const respuesta = await this.solicitudesService.getPrediccionAsignatura(
        params
      );

      this.prediccion = respuesta;
      this.estadisticasPrediccion = respuesta.probabilidades;
      this.prediccionLista = true;
      console.log("datos recibidos de prediccion", respuesta);
      this.systemService.setLoading(false);
    } catch (e) {
      this.erroresHandler.processError(
        e,
        "alert",
        "Error al obtener la predicción de la asignatura.",
        ""
      );
    }
  }

  async getAvanceAcademicoPrediccion(params) {
    try {
      const respuesta =
        await this.datosGeneralesService.getAvanceAcademicoPrediccion(params);
      this.avanceAcademico = respuesta;
      this.resumenAvance = respuesta.resumenAvance;
    } catch (e) {
      this.erroresHandler.processError(
        e,
        "alert",
        "Error al obtener avance académico de la predicción.",
        ""
      );
    }
  }

  async getChoqueHorario() {
    /*Código ajeno*/
  }

  async getPermiteChoque() {
    /*Código ajeno*/
  }

  async loadCargaAcademica() {
    this.resumenAvance = this.avanceAcademico.resumenAvance;
    this.mostrarAvanceCurricular = true;
  }

  cerrarModal() {
    this.displayModal = false;
    this.onCerrar.emit();
  }

  onShowDialog(dialog: any) {
    dialog.maximize();
  }
}
