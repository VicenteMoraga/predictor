"use strict";

//Correlación
const simpleStatistics = require("simple-statistics");

//Regresión lineal
const { SimpleLinearRegression } = require("ml-regression");

function getPrediccionAlumno(
  args,
  datosAsignatura,
  estadisticasAsignaturaPorSeccion,
  datosAlumno,
  datosSemestreAlumno,
  estadisticasPrerrequisitos,
  estadisticasAsignaturasSimilares
) {
  let variables = [];
  let recomendacion = "";

  // correlacion NotaPromedioPrerrequisitos / NotaAsignaturaAlumno
  let prediccionNotaAlumnoRegresionLineal = 0;
  let correlacion_notaPromPrerreq_notaAsignatura = 0;
  let muestraCorrelacion_notaPromPrerreq_notaAsignatura =
    estadisticasPrerrequisitos.listaNotaPromedioPrerrequisitos.length;
  if (estadisticasPrerrequisitos.listaNotaPromedioPrerrequisitos.length > 1) {
    prediccionNotaAlumnoRegresionLineal = this.calcularRegresionLineal(
      estadisticasPrerrequisitos.listaNotaPromedioPrerrequisitos,
      estadisticasPrerrequisitos.listaNotaAsignaturaAlumno,
      1,
      7,
      estadisticasPrerrequisitos.notaPromedioPrerrequisitosAlumno
    );

    correlacion_notaPromPrerreq_notaAsignatura = parseFloat(
      this.calcularCorrelacion(
        estadisticasPrerrequisitos.listaNotaPromedioPrerrequisitos,
        estadisticasPrerrequisitos.listaNotaAsignaturaAlumno
      ).toFixed(2)
    );
    if (isNaN(correlacion_notaPromPrerreq_notaAsignatura)) {
      correlacion_notaPromPrerreq_notaAsignatura = 0;
    }
  }

  // correlacion Promedio Aprobacion por Seccion / Total Alumnos por Seccion
  let listaPromedioAprobacionSecciones = estadisticasAsignaturaPorSeccion.map(
    (e) => {
      return parseFloat(e.promedioAprobacion);
    }
  );

  let listaTotalAlumnosSecciones = estadisticasAsignaturaPorSeccion.map((e) => {
    return parseFloat(e.totalAlumnos);
  });

  let prediccionPromedioAprobacion = 0;
  let correlacion_cantAlumnos_promedioAprobacion = 0;
  let muestraCorrelacion_cantAlumnos_promedioAprobacion =
    listaTotalAlumnosSecciones.length;
  if (listaPromedioAprobacionSecciones.length > 1) {
    prediccionPromedioAprobacion = this.calcularRegresionLineal(
      listaTotalAlumnosSecciones,
      listaPromedioAprobacionSecciones,
      0,
      100,
      args.datosAsignatura.cantidadAlumnos + 1
    );
    correlacion_cantAlumnos_promedioAprobacion = parseFloat(
      this.calcularCorrelacion(
        listaTotalAlumnosSecciones,
        listaPromedioAprobacionSecciones
      ).toFixed(2)
    );
    if (isNaN(correlacion_cantAlumnos_promedioAprobacion)) {
      correlacion_cantAlumnos_promedioAprobacion = 0;
    }
  }

  // correlacion Prorcentaje Aprobacion alumno / asignaturas inscritas
  let listaPorcentajeAprobacionSemestre = datosSemestreAlumno.map((e) => {
    return e.porcentajeAprobacion;
  });

  let listaTotalAsignaturasSemestre = datosSemestreAlumno.map((e) => {
    return e.asignaturasTotal;
  });

  let asignaturasInscritasAlumno =
    args.ultimoSemestreCursado[0].asignaturasTotal;
  let prediccionPorcentajeAprobacionAlumno = 0;
  let correlacion_totalAsignaturas_porcentajeAprobacion = 0;
  let muestraCorrelacion_totalAsignaturas_porcentajeAprobacion =
    listaTotalAsignaturasSemestre.length;

  if (listaPromedioAprobacionSecciones.length > 1) {
    prediccionPorcentajeAprobacionAlumno = this.calcularRegresionLineal(
      listaTotalAsignaturasSemestre,
      listaPorcentajeAprobacionSemestre,
      0,
      100,
      asignaturasInscritasAlumno + 1
    );

    correlacion_totalAsignaturas_porcentajeAprobacion = parseFloat(
      this.calcularCorrelacion(
        listaTotalAsignaturasSemestre,
        listaPorcentajeAprobacionSemestre
      ).toFixed(2)
    );
    if (isNaN(correlacion_totalAsignaturas_porcentajeAprobacion)) {
      correlacion_totalAsignaturas_porcentajeAprobacion = 0;
    }
  }

  console.log(
    "cantidadAlumnosInscritosAsignatura",
    args.datosAsignatura.cantidadAlumnos,
    "correlacion_cantAlumnos_promedioAprobacion:",
    correlacion_cantAlumnos_promedioAprobacion,
    "prediccion:",
    prediccionPromedioAprobacion
  );

  console.log(
    "NotaPromedioprerrequistosAlumno",
    estadisticasPrerrequisitos.notaPromedioPrerrequisitosAlumno,
    "correlacion_notaPromPrerreq_notaAsignatura:",
    correlacion_notaPromPrerreq_notaAsignatura,
    "prediccion:",
    prediccionNotaAlumnoRegresionLineal
  );

  console.log(
    "asignaturasInscritasAlumno",
    asignaturasInscritasAlumno + 1,
    " correlacion_totalAsignaturas_porcentajeAprobacion:",
    correlacion_totalAsignaturas_porcentajeAprobacion,
    "prediccion:",
    prediccionPorcentajeAprobacionAlumno
  );

  //calculo de la probabilidad de aprobación
  let probabilidadAprobacion = getProbabilidadAprobacion(
    correlacion_cantAlumnos_promedioAprobacion,
    prediccionPromedioAprobacion,
    correlacion_notaPromPrerreq_notaAsignatura,
    prediccionNotaAlumnoRegresionLineal,
    correlacion_totalAsignaturas_porcentajeAprobacion,
    prediccionPorcentajeAprobacionAlumno,
    args,
    datosAsignatura,
    datosAlumno,
    datosSemestreAlumno,
    estadisticasPrerrequisitos,
    estadisticasAsignaturasSimilares
  );

  // Variables de la predicción
  let notaPromAprobadosValida = true;
  let mensajePromNotas = "";
  let notaAsignaturaValida = true;
  let mensajeNotaAsig = "";
  let PromedioPrerrequisitosValida = true;
  let mensajePromedioPrerrequisitos = "";
  let mensajeCorrelacion_cantAlumnos_promedioAprobacion = "";
  let correlacion_cantAlumnos_promedioAprobacionValida = true;
  let mensajeCorrelacion_notaPromPrerreq_notaAsignatura = "";
  let correlacion_notaPromPrerreq_notaAsignaturaValida = true;
  if (datosAsignatura.totalAprobados == 0) {
    mensajeNotaAsig = "Sin aprobados";
    notaAsignaturaValida = false;
    if (datosAsignatura.totalAlumnos == 0) {
      notaPromAprobadosValida = false;
      mensajePromNotas = "Sin datos";
      mensajeNotaAsig = "Sin datos";
    }
  }

  if (estadisticasPrerrequisitos.notaPromedioPrerrequisitosAlumno == 0) {
    mensajePromedioPrerrequisitos = "Sin datos";
    PromedioPrerrequisitosValida = false;
    if (estadisticasPrerrequisitos.cantPrerrequisitos == 0) {
      mensajePromedioPrerrequisitos = "Sin prerrequisitos";
    }
  } else if (
    estadisticasPrerrequisitos.prerrequisitosAprobados.length <= 0 &&
    estadisticasPrerrequisitos.prerrequisitosAprobados.length <= 0
  ) {
    mensajePromedioPrerrequisitos = "Sin datos";
    PromedioPrerrequisitosValida = false;
  }

  if (muestraCorrelacion_cantAlumnos_promedioAprobacion == 0) {
    mensajeCorrelacion_cantAlumnos_promedioAprobacion = "Sin datos";
    correlacion_cantAlumnos_promedioAprobacionValida = false;
  }

  if (muestraCorrelacion_notaPromPrerreq_notaAsignatura == 0) {
    mensajeCorrelacion_notaPromPrerreq_notaAsignatura = "Sin datos";
    correlacion_notaPromPrerreq_notaAsignaturaValida = false;
  }

  recomendacion = getRecomendacion(
    probabilidadAprobacion,
    estadisticasPrerrequisitos
  );

  variables.push(
    getVariableRelacion(
      correlacion_cantAlumnos_promedioAprobacion,
      "Cantidad alumnos inscritos",
      "Promedio de aprobación de la asignatura",
      muestraCorrelacion_notaPromPrerreq_notaAsignatura
    )
  );

  variables.push(
    getVariableRelacion(
      correlacion_notaPromPrerreq_notaAsignatura,
      "Nota promedio de prerrequisito",
      "Nota final de la asignatura",
      muestraCorrelacion_notaPromPrerreq_notaAsignatura
    )
  );

  if (datosAsignatura.promedioAprobacion >= 70) {
    variables.push({
      nombre: "Promedio Aprobación",
      estatus: "Alta",
      promedioAprobacion: datosAsignatura.promedioAprobacion,
      muestra: muestraCorrelacion_notaPromPrerreq_notaAsignatura,
    });
  } else if (datosAsignatura.promedioAprobacion <= 60) {
    variables.push({
      nombre: "Promedio Aprobación",
      estatus: "Baja",
      promedioAprobacion: datosAsignatura.promedioAprobacion,
      muestra: muestraCorrelacion_notaPromPrerreq_notaAsignatura,
    });
  }

  if (
    estadisticasPrerrequisitos.prerrequisitosAprobados.length ==
    estadisticasPrerrequisitos.cantPrerrequisitos
  ) {
    if (
      args.datosAsignatura.prerrequisitos.filter((e) => e.nota >= 5).length >= 1
    ) {
      variables.push({
        nombre: "Prerrequisitos",
        estatus: "Alta",
        asignaturas: args.datosAsignatura.prerrequisitos
          .map((e) => {
            return {
              nombre: e.codigoExterno + " - " + e.nombre,
              nota: e.nota,
            };
          })
          .filter((e) => e.nota >= 5),
        tipo: "nota",
      });
    } else {
      variables.push({
        nombre: "Prerrequisitos",
        estatus: "Baja",
        asignaturas: args.datosAsignatura.prerrequisitos
          .map((e) => {
            return {
              nombre: e.codigoExterno + " - " + e.nombre,
              nota: e.nota,
            };
          })
          .filter((e) => e.nota < 5),
        tipo: "nota",
      });
    }
  } else {
    variables.push({
      nombre: "Prerrequisitos",
      estatus: "Baja",
      asignaturas: args.datosAsignatura.prerrequisitos
        .map((e) => {
          return {
            nombre: e.codigoExterno + " - " + e.nombre,
            nota: e.nota,
          };
        })
        .filter((e) => e.nota < 5),
      tipo: "nota",
    });

    if (
      args.datosAsignatura.prerrequisitos.filter((e) => e.nota >= 5).length >= 1
    ) {
      variables.push({
        nombre: "Prerrequisitos",
        estatus: "Alta",
        asignaturas: args.datosAsignatura.prerrequisitos
          .map((e) => {
            return {
              nombre: e.codigoExterno + " - " + e.nombre,
              nota: e.nota,
            };
          })
          .filter((e) => e.nota >= 5),
        tipo: "nota",
      });
    }
  }

  if (args.datosAsignatura.permiteChoque != undefined) {
    console.log("permite choque", args.datosAsignatura.permiteChoque);
    let estatus = "";
    if (args.datosAsignatura.permiteChoque) {
      estatus = "Alta";
    } else {
      estatus = "Baja";
    }
    if (args.datosAsignatura.asignaturasTope.length > 0) {
      variables.push({
        nombre: "Tope horario",
        estatus: estatus,
        asignaturas: args.datosAsignatura.asignaturasTope.map((e) => {
          return {
            nombre: e.nombre,
            codigoExterno: e.codigoExterno,
          };
        }),
        tipo: "horario",
      });
    }
  }
  return {
    probabilidades: [
      {
        nombre: "Porcentaje de aprobación histórico",
        valor: datosAsignatura.promedioAprobacion,
        tipo: "probabilidad",
        valido: notaPromAprobadosValida,
        mensaje: mensajePromNotas,
      },
      {
        nombre: "Promedio notas de aprobados histórico",
        valor: datosAsignatura.notaPromedioAprobados,
        tipo: "numero",
        valido: notaAsignaturaValida,
        mensaje: mensajeNotaAsig,
      },
      {
        nombre: "Cupo asignatura/alumnos inscritos",
        valor: {
          cantidadAlumnos: args.datosAsignatura.cantidadAlumnos,
          cupo: args.datosAsignatura.cupo,
        },
        tipo: "numero",
        valido: true,
      },

      {
        nombre: "Relación alumnos inscritos/aprobación asignatura",
        valor: correlacion_cantAlumnos_promedioAprobacion,
        tipo: "relacion",
        valido: correlacion_cantAlumnos_promedioAprobacionValida,
        muestra: muestraCorrelacion_cantAlumnos_promedioAprobacion,
        mensaje: mensajeCorrelacion_cantAlumnos_promedioAprobacion,
      },
      {
        nombre: "Recomendación",
        valor: recomendacion,
        tipo: "cadena",
        valido: true,
      },
      {
        nombre: "Probabilidad de aprobación",
        valor: probabilidadAprobacion,
        tipo: "probabilidad",
        valido: true,
      },

      {
        nombre: "Promedio notas de prerrequisito alumno",
        valor: estadisticasPrerrequisitos.notaPromedioPrerrequisitosAlumno,
        tipo: "numero",
        valido: PromedioPrerrequisitosValida,
        mensaje: mensajePromedioPrerrequisitos,
      },

      {
        nombre: "Relación nota prerrequisito/nota asignatura",
        valor: correlacion_notaPromPrerreq_notaAsignatura,
        tipo: "relacion",
        valido: correlacion_notaPromPrerreq_notaAsignaturaValida,
        muestra: muestraCorrelacion_notaPromPrerreq_notaAsignatura,
        mensaje: mensajeCorrelacion_notaPromPrerreq_notaAsignatura,
      },
    ],
    recomendacion: recomendacion,
    variables: variables.sort((a, b) => {
      if (a.estatus === "Alta" && b.estatus !== "Alta") {
        if (recomendacion.valor == "APROBAR SOLICITUD") return -1;
        else return 1;
      }
      if (a.estatus !== "Alta" && b.estatus === "Alta") {
        if (recomendacion.valor == "APROBAR SOLICITUD") return 1;
        else return -1;
      }
      return a.estatus.localeCompare(b.estatus);
    }),
  };
}
function getVariableRelacion(
  correlacion,
  grupoDeDatos1,
  grupoDeDatos2,
  muestra
) {
  let negativo = false;
  let estatus = "Alta";
  let relacion = "";
  let valido = true;
  if (muestra == 0) {
    valido = false;
  } else {
    if (correlacion < 0) {
      negativo = true;
    }
    let valorAbsoluto_correlacion = Math.abs(correlacion);
    if (valorAbsoluto_correlacion >= 0.7) {
      relacion = "Muy alta";
    } else if (
      valorAbsoluto_correlacion < 0.7 &&
      valorAbsoluto_correlacion >= 0.5
    ) {
      relacion = "alta";
    } else if (
      valorAbsoluto_correlacion < 0.5 &&
      valorAbsoluto_correlacion >= 0.3
    ) {
      relacion = "Moderada";
    } else if (
      valorAbsoluto_correlacion < 0.3 &&
      valorAbsoluto_correlacion >= 0.1
    ) {
      relacion = "Baja";
    } else {
      relacion = "Sin relacion";
      estatus = "Baja";
    }
  }

  return {
    nombre: "Relación",
    valido: valido,
    estatus: estatus,
    relacion: relacion,
    negativo: negativo,
    grupoDeDatos1: grupoDeDatos1,
    grupoDeDatos2: grupoDeDatos2,
    valor: correlacion,
  };
}

function calcularCorrelacion(datos1, datos2) {
  if (datos1.length !== datos2.length) {
    throw new Error("Ambos conjuntos de datos deben tener la misma longitud");
  }

  return simpleStatistics.sampleCorrelation(datos1, datos2);
}

function calcularRegresionLineal(
  datos1,
  datos2,
  valorMinimo,
  valorMaximo,
  valorAPredecir
) {
  if (datos1.length !== datos2.length) {
    throw new Error("Ambos conjuntos de datos deben tener la misma longitud");
  }
  let regresionLineal = new SimpleLinearRegression(datos1, datos2);
  let prediccion = regresionLineal.predict(valorAPredecir);
  if (prediccion < valorMinimo) {
    prediccion = valorMinimo;
  } else if (prediccion > valorMaximo) {
    prediccion = valorMaximo;
  }
  return prediccion;
}

function getSeccionesAsignatura(data) {
  return [...new Set(data.map((e) => e.seccion))];
}

function aproximacionNota(promedioIN) {
  /* Función para calcular aproximación de una nota (No soy el autor)*/
}

function getAniosConsecutivos(anios) {
  let anioMayor = anios.reduce((previous, current) => {
    return current > previous ? current : previous;
  });

  let anioMenor = anios.reduce((previous, current) => {
    return current < previous && current != 0 ? current : previous;
  });
  let aniosConsecutivos = [];
  for (let i = 0; anioMenor <= anioMayor; i++) {
    aniosConsecutivos[i] = anioMenor;
    anioMenor += 1;
  }

  return aniosConsecutivos;
}

function getProbabilidadAprobacion(
  correlacion_cantAlumnos_promedioAprobacion,
  prediccionPromedioAprobacion,
  correlacion_notaPromPrerreq_notaAsignatura,
  prediccionNotaAlumnoRegresionLineal,
  correlacion_totalAsignaturas_porcentajeAprobacion,
  prediccionPorcentajeAprobacionAlumno,
  args,
  datosAsignatura,
  datosAlumno,
  datosSemestreAlumno,
  estadisticasPrerrequisitos,
  estadisticasAsignaturasSimilares
) {
  let promedioAprobacionAsignatura = datosAsignatura.promedioAprobacion;
  let notaPromedioPrerrequisitosAlumno =
    estadisticasPrerrequisitos.notaPromedioPrerrequisitosAlumno;

  let notaPromedioPrerrequisitos =
    estadisticasPrerrequisitos.notaPromedioPrerrequisitos;
  console.log(
    "nota promedio de los prerrequisitos",
    notaPromedioPrerrequisitos,
    " nota promedio del alumno de los prerrequisitos ",
    notaPromedioPrerrequisitosAlumno
  );
  let porcentaje = 100;
  let probabilidad = 0;

  let valorAbsoluto_correlacion_cantAlumnos_promedioAprobacion = Math.abs(
    correlacion_cantAlumnos_promedioAprobacion
  );
  if (valorAbsoluto_correlacion_cantAlumnos_promedioAprobacion >= 0.7) {
    porcentaje -= 30;
    probabilidad += prediccionPromedioAprobacion * 0.3;
    console.log(
      "prediccionPromedioAprobacion",
      prediccionPromedioAprobacion * 0.3
    );
  } else if (
    valorAbsoluto_correlacion_cantAlumnos_promedioAprobacion < 0.7 &&
    valorAbsoluto_correlacion_cantAlumnos_promedioAprobacion >= 0.5
  ) {
    porcentaje -= 20;
    probabilidad += prediccionPromedioAprobacion * 0.2;
    console.log(
      "prediccionPromedioAprobacion",
      prediccionPromedioAprobacion * 0.2
    );
  } else if (
    valorAbsoluto_correlacion_cantAlumnos_promedioAprobacion < 0.5 &&
    valorAbsoluto_correlacion_cantAlumnos_promedioAprobacion >= 0.3
  ) {
    porcentaje -= 15;
    probabilidad += prediccionPromedioAprobacion * 0.15;
    console.log(
      "prediccionPromedioAprobacion",
      prediccionPromedioAprobacion * 0.15
    );
  } else if (
    valorAbsoluto_correlacion_cantAlumnos_promedioAprobacion < 0.3 &&
    valorAbsoluto_correlacion_cantAlumnos_promedioAprobacion >= 0.1
  ) {
    porcentaje -= 10;
    probabilidad += prediccionPromedioAprobacion * 0.1;
    console.log(
      "prediccionPromedioAprobacion",
      prediccionPromedioAprobacion * 0.1
    );
  }

  let valorAbsoluto_correlacion_notaPromPrerreq_notaAsignatura = Math.abs(
    correlacion_notaPromPrerreq_notaAsignatura
  );
  if (valorAbsoluto_correlacion_notaPromPrerreq_notaAsignatura >= 0.7) {
    porcentaje -= 60;
    probabilidad += (prediccionNotaAlumnoRegresionLineal / 7) * 100 * 0.6;
    console.log(
      "prediccionNotaAlumnoRegresionLineal",
      (prediccionNotaAlumnoRegresionLineal / 7) * 100 * 0.6
    );
  } else if (
    valorAbsoluto_correlacion_notaPromPrerreq_notaAsignatura < 0.7 &&
    valorAbsoluto_correlacion_notaPromPrerreq_notaAsignatura >= 0.5
  ) {
    porcentaje -= 50;
    probabilidad += (prediccionNotaAlumnoRegresionLineal / 7) * 100 * 0.5;
    console.log(
      "prediccionNotaAlumnoRegresionLineal",
      (prediccionNotaAlumnoRegresionLineal / 7) * 100 * 0.5
    );
  } else if (
    valorAbsoluto_correlacion_notaPromPrerreq_notaAsignatura < 0.5 &&
    valorAbsoluto_correlacion_notaPromPrerreq_notaAsignatura >= 0.3
  ) {
    porcentaje -= 30;
    probabilidad += (prediccionNotaAlumnoRegresionLineal / 7) * 100 * 0.3;
    console.log(
      "prediccionNotaAlumnoRegresionLineal",
      (prediccionNotaAlumnoRegresionLineal / 7) * 100 * 0.3
    );
  } else if (
    valorAbsoluto_correlacion_notaPromPrerreq_notaAsignatura < 0.3 &&
    valorAbsoluto_correlacion_notaPromPrerreq_notaAsignatura >= 0.1
  ) {
    porcentaje -= 20;
    probabilidad += (prediccionNotaAlumnoRegresionLineal / 7) * 100 * 0.2;
    console.log(
      "prediccionNotaAlumnoRegresionLineal",
      (prediccionNotaAlumnoRegresionLineal / 7) * 100 * 0.2
    );
  }

  let valorAbsoluto_correlacion_totalAsignaturas_porcentajeAprobacion =
    Math.abs(correlacion_totalAsignaturas_porcentajeAprobacion);
  if (valorAbsoluto_correlacion_totalAsignaturas_porcentajeAprobacion >= 0.7) {
    porcentaje -= 10;
    probabilidad += prediccionPorcentajeAprobacionAlumno * 0.1;
    console.log(
      "prediccionPorcentajeAprobacionAlumno",
      prediccionPorcentajeAprobacionAlumno * 0.1
    );
  } else if (
    valorAbsoluto_correlacion_totalAsignaturas_porcentajeAprobacion < 0.7 &&
    valorAbsoluto_correlacion_totalAsignaturas_porcentajeAprobacion >= 0.5
  ) {
    porcentaje -= 7;
    probabilidad += prediccionPorcentajeAprobacionAlumno * 0.07;
    console.log(
      "prediccionPorcentajeAprobacionAlumno",
      prediccionPorcentajeAprobacionAlumno * 0.07
    );
  } else if (
    valorAbsoluto_correlacion_totalAsignaturas_porcentajeAprobacion < 0.5 &&
    valorAbsoluto_correlacion_totalAsignaturas_porcentajeAprobacion >= 0.3
  ) {
    porcentaje -= 5;
    probabilidad += prediccionPorcentajeAprobacionAlumno * 0.05;
    console.log(
      "prediccionPorcentajeAprobacionAlumno",
      prediccionPorcentajeAprobacionAlumno * 0.05
    );
  } else if (
    valorAbsoluto_correlacion_totalAsignaturas_porcentajeAprobacion < 0.3 &&
    valorAbsoluto_correlacion_totalAsignaturas_porcentajeAprobacion >= 0.1
  ) {
    porcentaje -= 3;
    probabilidad += prediccionPorcentajeAprobacionAlumno * 0.03;
    console.log(
      "prediccionPorcentajeAprobacionAlumno",
      prediccionPorcentajeAprobacionAlumno * 0.03
    );
  }
  let notaCalculo;
  if (estadisticasAsignaturasSimilares.listaAsignaturasSimilares.length == 0) {
    notaCalculo = notaPromedioPrerrequisitosAlumno;
  } else {
    notaCalculo =
      estadisticasAsignaturasSimilares.promedioNotaAsignaturasSimilar;
  }
  let calc =
    ((((notaCalculo / datosAsignatura.notaPromedioAprobados) *
      100 *
      porcentaje) /
      100) *
      promedioAprobacionAsignatura) /
    100;

  if (calc > porcentaje) {
    probabilidad += porcentaje;
    calc = porcentaje;
  } else {
    probabilidad += calc;
  }
  console.log("porcentaje", porcentaje, calc, "\n");
  console.log(
    "--------------------------------------------------------------------------------------------------------------"
  );

  return probabilidad.toFixed(0);
}

function getRecomendacion(probabilidadAprobacion, estadisticasPrerrequisitos) {
  let valor = "";
  let mensaje = "";
  let cantPrerrequisitosSinAprobar =
    estadisticasPrerrequisitos.prerrequisitosReprobados.length +
    estadisticasPrerrequisitos.prerrequisitosCursando.length +
    estadisticasPrerrequisitos.prerrequisitosSinCursar.length;

  if (probabilidadAprobacion >= 60) {
    valor = "APROBAR SOLICITUD";
    let mensajeProbabilidad = "";
    if (probabilidadAprobacion >= 80) mensajeProbabilidad = "muy alta";
    else mensajeProbabilidad = "alta";
    mensaje =
      "Se recomienda aprobar la solicitud, ya que tiene una probabilidad de aprobación " +
      mensajeProbabilidad;
  } else {
    valor = "RECHAZAR SOLICITUD";
    let mensajeProbabilidad = "";
    if (probabilidadAprobacion < 60) mensajeProbabilidad = "baja";
    else mensajeProbabilidad = "muy baja";
    mensaje =
      "Se recomienda rechazar la solicitud, ya que tiene una probabilidad de aprobación " +
      mensajeProbabilidad;
  }

  if (cantPrerrequisitosSinAprobar > 0) {
    valor = "RECHAZAR SOLICITUD";
    mensaje =
      "Se recomienda rechazar la solicitud, ya que tiene " +
      cantPrerrequisitosSinAprobar +
      " prerrequisito/s sin aprobar";
  }

  return {
    valor,
    mensaje,
  };
}

module.exports = {
  calcularCorrelacion,
  getSeccionesAsignatura,
  aproximacionNota,
  getAniosConsecutivos,
  calcularRegresionLineal,
  getPrediccionAlumno,
};
