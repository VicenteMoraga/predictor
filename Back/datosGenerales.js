let getAvanceAcademicoPrediccion = async (request, response) => {
  try {
    let args = JSON.parse(
      request.body.arg === undefined ? "{}" : request.body.arg
    );
    let msg = validador.validarParametro(args, "numero", "rut", true);
    msg += validador.validarParametro(args, "numero", "codigoProgrma", true);

    if (msg == "") {
      args.codPrograma = args.codigoProgrma;
      let asignaturas = await invoker(
        global.config.serv_modificaInscripcionDirector,
        "obtieneAvanceAcademico",
        args
      );

      asignaturas = asignaturas.map((e) => {
        return {
          id: e.codExterno,
          codExterno: e.codExterno,
          codAsignatura: e.codAsignatura,
          codTema: e.codTema,
          nombre: e.asignatura,
          periodo: e.periodoCursado,
          semestre: e.semestreCursado,
          estadoTexto: e.estado,
          nota: e.notaFinal,
          intento: e.vezCursa,
        };
      });

      let anios = getAnios(asignaturas);

      let aniosConsecutivos = calculos.getAniosConsecutivos(anios);

      let anioMayor = anios.reduce((previous, current) => {
        return current > previous ? current : previous;
      });

      asignaturasPorAnio = [];
      let i = 0;
      aniosConsecutivos.forEach((anio) => {
        semestres = [1, 2];
        semestres.forEach((semestre) => {
          resumenPorSemestre = {};
          asignaturasPorSemestre = {};
          asignaturasPorSemestre[semestre] = asignaturas.filter(
            (e) => e.periodo == anio && e.semestre == semestre
          );

          if (asignaturasPorSemestre[semestre].length > 0) {
            resumenPorSemestre = getResumenAvanceSemestre(
              asignaturasPorSemestre,
              semestre,
              anio
            );
            asignaturasPorAnio[i] = resumenPorSemestre;
          } else {
            if (!(semestre == 2 && anio == anioMayor)) {
              resumenPorSemestre = setResumenAvanceVacio(semestre, anio);
              asignaturasPorAnio[i] = resumenPorSemestre;
            }
          }

          i += 1;
        });
      });

      response.json(
        reply.ok({
          resumenAvance: asignaturasPorAnio.sort((a, b) => b.id - a.id),
          aniosCursados: anios,
        })
      );
    } else {
      response.json(reply.error(msg));
    }
  } catch (e) {
    response.json(reply.fatal(e));
  }
};

let getResumenAvanceSemestre = (asignaturasPorSemestre, semestre, anio) => {
  let asignaturas = [];
  let asignaturasTotal = asignaturasPorSemestre[semestre].length;
  let asignaturasAprobadas = 0;
  let asignaturasReprobadas = 0;
  let i = 0;
  asignaturasPorSemestre[semestre].forEach((asignatura) => {
    if (asignatura.estadoTexto == "APROBADO") {
      asignaturasAprobadas += 1;
    } else if (asignatura.estadoTexto == "REPROBADO") {
      asignaturasReprobadas += 1;
    }
    asignaturas[i] = {
      id: asignatura.id,
      nombre: asignatura.nombre,
      estadoTexto: asignatura.estadoTexto,
      nota: asignatura.nota,
      intento: asignatura.intento,
      codExterno: asignatura.codExterno,
    };
    i += 1;
  });
  return {
    id: anio.toString() + semestre.toString(),
    semestre,
    periodo: anio,
    asignaturasTotal,
    asignaturasAprobadas,
    asignaturasReprobadas,
    asignaturas: asignaturas.sort((a, b) => b.id - a.id),
    porcentajeAprobacion: getPorcentajeAprobación(
      asignaturasAprobadas,
      asignaturasReprobadas,
      asignaturasTotal
    ),
    semestreCursado: true,
  };
};

let setResumenAvanceVacio = (semestre, anio) => {
  return {
    id: anio.toString() + semestre.toString(),
    semestre: semestre,
    periodo: anio,
    asignaturasTotal: 0,
    asignaturasAprobadas: 0,
    asignaturasReprobadas: 0,
    semestreCursado: false,
  };
};

let getPorcentajeAprobación = (
  asignaturasAprobadas,
  asignaturasReprobadas,
  asignaturasTotal
) => {
  if (asignaturasTotal > 0) {
    if (asignaturasAprobadas == 0 && asignaturasReprobadas == 0) {
      return -1;
    }
    return parseFloat(
      ((asignaturasAprobadas / asignaturasTotal) * 100).toFixed(2)
    );
  } else {
    return -1;
  }
};
