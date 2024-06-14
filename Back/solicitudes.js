let getNotasFinalesPrerrequisitos = async (
  periodoInicial,
  periodoFinal,
  prerrequisitos
) => {
  try {
    let lista = [];
    for (let prerrequisito of prerrequisitos) {
      lista.push(
        await getNotasFinalesAsignatura(
          periodoInicial,
          periodoFinal,
          prerrequisito.codigoInterno,
          prerrequisito.codigoInterno,
          false
        )
      );
    }
    return lista;
  } catch (e) {
    console.log(e);
  }
};

let getEstadisticasPrerrequisitos = async (
  periodoInicial,
  periodoFinal,
  notasFinales,
  codAsignatura,
  prerrequisitos
) => {
  try {
    let listaNotaPromedioPrerrequisitos = [];
    let datosPrerrequisitos = [];
    let listaNotaAsignaturaAlumno = [];
    let notasPrerrequisitoAlumno = 0;
    let notaPromedioPrerrequisitos = 0;
    let notaPromedioPrerrequisitosAlumno = 0;
    datosPrerrequisitos = await getNotasFinalesPrerrequisitos(
      periodoInicial,
      periodoFinal,
      prerrequisitos
    );
    if (prerrequisitos.length >= 1) {
      prerrequisitos.forEach((e) => {
        if (parseFloat(e.nota) == 0) {
          notasPrerrequisitoAlumno += 1;
        } else {
          notasPrerrequisitoAlumno += parseFloat(e.nota);
        }
      });
      notaPromedioPrerrequisitosAlumno = calculos.aproximacionNota(
        notasPrerrequisitoAlumno / prerrequisitos.length
      );

      for (i = 0; notasFinales.length > i; i++) {
        if (notasFinales[i].notaFinal) {
          let sumaNotasPrerequisitosAlumno = 0;
          if (datosPrerrequisitos.length > 0) {
            let cantPrerrequisitosCursados = 0;
            await datosPrerrequisitos.forEach((e) => {
              for (j = 0; e.notasFinales.length > j; j++) {
                if (notasFinales[i].rutAlumno == e?.notasFinales[j].rutAlumno) {
                  if (e.notasFinales[j].notaFinal != 0) {
                    sumaNotasPrerequisitosAlumno += parseFloat(
                      e.notasFinales[j].notaFinal
                    );
                    cantPrerrequisitosCursados += 1;
                  }
                }
              }
            });
            if (cantPrerrequisitosCursados != 0) {
              notaPromedioPrerrequisitos += calculos.aproximacionNota(
                sumaNotasPrerequisitosAlumno / cantPrerrequisitosCursados
              );
              listaNotaPromedioPrerrequisitos.push(
                calculos.aproximacionNota(
                  sumaNotasPrerequisitosAlumno / cantPrerrequisitosCursados
                )
              );
              listaNotaAsignaturaAlumno.push(notasFinales[i].notaFinal);
            }
          }
        }
      }
    }
    if (notaPromedioPrerrequisitos != 0) {
      notaPromedioPrerrequisitos = calculos.aproximacionNota(
        notaPromedioPrerrequisitos / listaNotaPromedioPrerrequisitos.length
      );
    }

    return {
      codAsignatura: codAsignatura,
      notaPromedioPrerrequisitosAlumno: notaPromedioPrerrequisitosAlumno,
      notaPromedioPrerrequisitos: notaPromedioPrerrequisitos,
      cantPrerrequisitos: prerrequisitos.length,
      prerrequisitosAprobados: prerrequisitos.filter(
        (e) => e.estadoTexto == "APROBADO"
      ),
      prerrequisitosReprobados: prerrequisitos.filter(
        (e) => e.estadoTexto == "REPROBADO"
      ),
      prerrequisitosCursando: prerrequisitos.filter(
        (e) => e.estadoTexto == "CURSANDO"
      ),
      prerrequisitosSinCursar: prerrequisitos.filter(
        (e) => e.estadoTexto == "SIN CURSAR"
      ),
      listaNotaPromedioPrerrequisitos: listaNotaPromedioPrerrequisitos,
      listaNotaAsignaturaAlumno: listaNotaAsignaturaAlumno,
    };
  } catch (e) {
    console.log(e);
  }
};

let getNotasFinalesAsignaturaPorSeccion = async (
  periodoInicial,
  periodoFinal,
  secciones,
  notasAlumno
) => {
  try {
    aniosConsecutivos = calculos.getAniosConsecutivos([
      periodoInicial,
      periodoFinal,
    ]);

    estadisticasNotasSeccion = [];
    await aniosConsecutivos.forEach((anio) => {
      semestres = [1, 2];
      semestres.forEach((semestre) => {
        secciones.forEach(async (seccion) => {
          // se desestiman años de pandemia (datos anómalos)
          if (anio != 2020 && anio != 2021) {
            notasSeccion = await notasAlumno.filter(
              (nota) =>
                nota.periodoActual == anio &&
                nota.semestreActual == semestre &&
                nota.seccion == seccion
            );
            if (notasSeccion.length > 0) {
              estadisticas = await getEstadisticasNotasAsignatura(notasSeccion);
              estadisticasNotasSeccion.push({
                periodo: anio,
                semestre: semestre,
                seccion: seccion,
                notaPromedio: estadisticas.notaPromedio,
                notaPromedioAprobados: estadisticas.notaPromedioAprobados,
                promedioAprobacion: estadisticas.promedioAprobacion,
                totalAlumnos: estadisticas.totalAlumnos,
                totalAprobados: estadisticas.totalAprobados,
              });
            }
          }
        });
      });
    });

    return estadisticasNotasSeccion;
  } catch (e) {
    console.log(e);
  }
};

let getEstadisticasNotasAsignatura = async (notasFinales) => {
  let sumaNotas = 0;
  let sumaNotasAprobados = 0;
  let cantAprobados = 0;

  listaNotas = notasFinales.map(async (notaAlumno) => {
    if (notaAlumno.notaFinal >= 4.0) {
      cantAprobados += 1;
      sumaNotasAprobados += notaAlumno.notaFinal;
    }
    sumaNotas += notaAlumno.notaFinal;
    return notaAlumno.notaFinal;
  });
  let promedioAprobacion = 0;
  let notaPromedio = 0;
  let notaPromedioAprobados = 0;
  let totalAlumnos = 0;
  if (listaNotas.length > 0) {
    totalAlumnos = listaNotas.length;
    promedioAprobacion = ((cantAprobados / totalAlumnos) * 100).toFixed(0);

    notaPromedio = calculos.aproximacionNota(sumaNotas / totalAlumnos);

    if (cantAprobados > 0) {
      notaPromedioAprobados = calculos.aproximacionNota(
        sumaNotasAprobados / cantAprobados
      );
    } else {
      notaPromedioAprobados = 0;
    }
  }

  return {
    notaPromedio: notaPromedio,
    notaPromedioAprobados: notaPromedioAprobados,
    promedioAprobacion: promedioAprobacion,
    totalAlumnos: listaNotas.length,
    totalAprobados: cantAprobados,
  };
};

//Función
let getNotasFinalesAsignatura = async (
  periodoInicial,
  periodoFinal,
  codAsignatura,
  codTema,
  prueba
) => {
  try {
    params = {
      periodoInicial: periodoInicial,
      periodoFinal: periodoFinal,
      codAsignatura: codAsignatura,
      codTema: codTema,
    };
    let notasFinales = [];
    let secciones = [];
    notasFinales = (
      await invoker(
        global.config.serv_modificaInscripcionDirector,
        "getNotasFinalesPorPeriodo",
        params
      )
    ).filter((e) => e.notaFinal != 0);

    if (notasFinales.length > 0) {
      secciones = calculos.getSeccionesAsignatura(notasFinales);
    }

    let estadisticasNotasAsignatura = await getEstadisticasNotasAsignatura(
      notasFinales
    );
    if (prueba) {
      return {
        codAsignatura: codAsignatura,
        notaPromedio: estadisticasNotasAsignatura.notaPromedio,
        notaPromedioAprobados:
          estadisticasNotasAsignatura.notaPromedioAprobados,
        promedioAprobacion: parseFloat(
          estadisticasNotasAsignatura.promedioAprobacion
        ),
        totalAlumnos: estadisticasNotasAsignatura.totalAlumnos,
        totalAprobados: estadisticasNotasAsignatura.totalAprobados,
        secciones: secciones,
      };
    } else {
      return {
        codAsignatura: codAsignatura,
        notaPromedio: estadisticasNotasAsignatura.notaPromedio,
        notaPromedioAprobados:
          estadisticasNotasAsignatura.notaPromedioAprobados,
        promedioAprobacion: parseFloat(
          estadisticasNotasAsignatura.promedioAprobacion
        ),
        totalAlumnos: estadisticasNotasAsignatura.totalAlumnos,
        totalAprobados: estadisticasNotasAsignatura.totalAprobados,
        secciones: secciones,
        notasFinales,
      };
    }
  } catch (e) {
    console.log();
  }
};

let getDatosAsignaturaPrueba = async (periodo, codAsignatura, rut) => {
  try {
    params = {
      periodoInicial: periodo,
      periodoFinal: periodo,

      codAsignatura: codAsignatura,
      codTema: codAsignatura,
    };
    lista = await invoker(
      global.config.serv_modificaInscripcionDirector,
      "getNotasFinalesPorPeriodo",
      params
    );
    let datosAlumno = lista.find((e) => e.rutAlumno == rut);
    let alumnosInscritos = 0;
    lista.forEach((e) => {
      if (e.seccion == datosAlumno.seccion) {
        alumnosInscritos += 1;
      }
    });

    return {
      notaFinal: datosAlumno.notaFinal,
      seccion: datosAlumno.seccion,
      alumnosInscritos: alumnosInscritos,
    };
  } catch (e) {
    console.log(e);
  }
};

let getPrerequisitos2 = async (rut, codAsignatura) => {
  try {
    let params = {
      rut: parseInt(rut),
      codAsignatura: codAsignatura,
    };
    let prerequisitos = await invoker(
      global.config.serv_modificaInscripcionDirector,
      "obtienePrerrequisitoAsignaturas",
      params
    );

    return prerequisitos;
  } catch (e) {
    console.log(e);
  }
};

let getAsignaturasSimilares = (codigoAsignatura) => {
  let grupos = getGruposAsignaturas();
  for (let grupo of grupos) {
    if (
      grupo.asignaturasSimilares.find(
        (e) => e.codAsignatura == codigoAsignatura
      )
    ) {
      return grupo;
    }
  }
  return [];
};

let getEstadisticasAsignaturasSimilares = async (
  asignaturasSimilares,
  resumenAvance
) => {
  let listaAsignaturasSimilares = [];
  let promedioNotaAsignaturasSimilar = 0;
  let promedioNotaAsignaturasSimilarAprobadas = 0;
  for (let asignaturaSimilar of asignaturasSimilares) {
    for (let semestre of resumenAvance) {
      if (
        semestre.asignaturas.find(
          (e) => asignaturaSimilar.codExterno == e.codExterno
        )
      ) {
        listaAsignaturasSimilares.push(
          semestre.asignaturas.find(
            (e) => asignaturaSimilar.codExterno == e.codExterno
          )
        );
      }
    }
  }

  if (listaAsignaturasSimilares.length > 0) {
    let sumaNotas = 0;
    let sumaNotasAprobados = 0;
    let cantAprobados = 0;
    for (let asignaturaSimilar of listaAsignaturasSimilares) {
      sumaNotas += parseFloat(asignaturaSimilar.nota);
      if (asignaturaSimilar.estadoTexto == "APROBADO") {
        sumaNotasAprobados += parseFloat(asignaturaSimilar.nota);
        cantAprobados += 1;
      }
    }
    if (cantAprobados > 0) {
      promedioNotaAsignaturasSimilarAprobadas = calculos.aproximacionNota(
        sumaNotasAprobados / cantAprobados
      );
    }

    promedioNotaAsignaturasSimilar = calculos.aproximacionNota(
      sumaNotas / listaAsignaturasSimilares.length
    );
  }

  return {
    promedioNotaAsignaturasSimilarAprobadas:
      promedioNotaAsignaturasSimilarAprobadas,
    promedioNotaAsignaturasSimilar: promedioNotaAsignaturasSimilar,
    listaAsignaturasSimilares: listaAsignaturasSimilares,
  };
};
let getPrediccionAsignatura = async (request, response) => {
  periodoInicial = 2017; //año arbitrario
  try {
    let args = JSON.parse(
      request.body.arg === undefined ? "{}" : request.body.arg
    );
    let msg = validador.validarParametro(args.alumno, "numero", "rut", true);
    if (msg == "") {
      periodoFinal = Math.max(...args.anios);

      // Datos asignatura
      let asignaturasSimilares = getAsignaturasSimilares(
        args.datosAsignatura.codAsignatura
      );
      let estadisticasAsignaturasSimilares =
        await getEstadisticasAsignaturasSimilares(
          asignaturasSimilares.asignaturasSimilares,
          args.resumenAvance
        );

      let datosAsignatura = await getNotasFinalesAsignatura(
        periodoInicial,
        periodoFinal,
        args.datosAsignatura.codAsignatura,
        args.datosAsignatura.codAsignatura,
        false
      );
      let estadisticasAsignaturaPorSeccion =
        await getNotasFinalesAsignaturaPorSeccion(
          periodoInicial,
          periodoFinal,
          datosAsignatura.secciones,
          datosAsignatura.notasFinales
        );

      let estadisticasPrerrequisitos = await getEstadisticasPrerrequisitos(
        periodoInicial,
        periodoFinal,
        datosAsignatura.notasFinales,
        datosAsignatura.codAsignatura,
        args.datosAsignatura.prerrequisitos
      );

      // Datos Alumno
      let datosAlumno = args.alumno;
      let datosSemestreAlumno = args.resumenAvance;

      prediccion = calculos.getPrediccionAlumno(
        args,
        datosAsignatura,
        estadisticasAsignaturaPorSeccion,
        datosAlumno,
        datosSemestreAlumno,
        estadisticasPrerrequisitos,
        estadisticasAsignaturasSimilares
      );

      response.json(reply.ok(prediccion));
    } else {
      response.json(reply.error(msg));
    }
  } catch (e) {
    response.json(reply.fatal(e));
  }
};

//
let getGruposAsignaturas = () => {
  return [
    {
      nombre: "",
      asignaturasSimilares: [
        {
          codExterno: "ICI115",
          codAsignatura: "REC690",
          codTema: "REC690",
          nombre: "INTRODUCCIÓN A LA INGENIERÍA INFORMÁTICA",
        },
      ],
    },
    {
      nombre: "Sello UV",
      asignaturasSimilares: [
        {
          codExterno: "ICI-TIUV 226",
          codAsignatura: "REC707",
          codTema: "REC707",
          nombre: "TALLER DE INTEGRACIÓN PERFIL SELLO UV I",
        },
        {
          codExterno: "ICI-TIUV 327",
          codAsignatura: "REC721",
          codTema: "REC721",
          nombre: "TALLER DE INTEGRACIÓN PERFIL SELLO UV II",
        },
        {
          codExterno: "ICI-TIUV 417",
          codAsignatura: "REC728",
          codTema: "REC728",
          nombre: "TALLER DE INTEGRACIÓN PERFIL SELLO UV III",
        },
      ],
    },
    {
      nombre: "",
      asignaturasSimilares: [
        {
          codExterno: "ICI513",
          codAsignatura: "REC739",
          codTema: "",
          nombre: "GESTIÓN DE PROYECTOS INFORMÁTICOS",
        },
        {
          codExterno: "ICI414",
          codAsignatura: "REC725",
          codTema: "",
          nombre: "METODOLOGÍAS DE DISEÑO",
        },
        {
          codExterno: "ICI325",
          codAsignatura: "REC719",
          codTema: "",
          nombre: "METODOLOGÍA DE ANÁLISIS",
        },
      ],
    },
    {
      nombre: "Desarrollo personal",
      asignaturasSimilares: [
        {
          codExterno: "ICI114",
          codAsignatura: "REC689",
          codTema: "REC689",
          nombre: "DESARROLLO PERSONAL I",
        },
        {
          codExterno: "ICI124",
          codAsignatura: "REC695",
          codTema: "REC695",
          nombre: "DESARROLLO PERSONAL II",
        },
        {
          codExterno: "ICI422",
          codAsignatura: "REC730",
          codTema: "",
          nombre: "ÉTICA Y LEGISLACIÓN",
        },
      ],
    },
    {
      nombre: "Base de datos",
      asignaturasSimilares: [
        {
          codExterno: "ICI315",
          codAsignatura: "REC712",
          codTema: "REC712",
          nombre: "BASES DE DATOS I",
        },
        {
          codExterno: "ICI324",
          codAsignatura: "REC718",
          codTema: "REC718",
          nombre: "BASES DE DATOS Y PROGRAMACIÓN WEB",
        },
        {
          codExterno: "ICI416",
          codAsignatura: "REC727",
          codTema: "REC727",
          nombre: "BASES DE DATOS II",
        },
        {
          codExterno: "ICI426",
          codAsignatura: "REC735",
          codTema: "REC735",
          nombre: "BASES DE DATOS III",
        },
        {
          codExterno: "ICI523",
          codAsignatura: "",
          codTema: "REC746",
          nombre: "INTELIGENCIA DE NEGOCIOS",
        },
      ],
    },
    {
      nombre: "Finanzas",
      asignaturasSimilares: [
        {
          codExterno: "ICI511",
          codAsignatura: "REC737",
          codTema: "REC737",
          nombre: "ADMINISTRACIÓN GENERAL",
        },
        {
          codExterno: "ICI512",
          codAsignatura: "REC738",
          codTema: "REC738",
          nombre: "CONTABILIDAD Y FINANZAS",
        },
        {
          codExterno: "ICI421",
          codAsignatura: "REC729",
          codTema: "REC729",
          nombre: "INNOVACIÓN Y EMPRENDIMIENTO",
        },
        {
          codExterno: "ICI522",
          codAsignatura: "REC745",
          codTema: "REC745",
          nombre: "ECONOMÍA",
        },
        {
          codExterno: "ICI521",
          codAsignatura: "REC744",
          codTema: "REC744",
          nombre: "EVALUACIÓN DE PROYECTOS",
        },
      ],
    },
    {
      nombre: "Ciencias",
      asignaturasSimilares: [
        {
          codExterno: "ICI113",
          codAsignatura: "REC688",
          codTema: "REC688",
          nombre: "QUÍMICA GENERAL",
        },
        {
          codExterno: "ICI123",
          codAsignatura: "REC694",
          codTema: "REC694",
          nombre: "FUNDAMENTOS DE FÍSICA",
        },
        {
          codExterno: "ICI223",
          codAsignatura: "REC704",
          codTema: "REC704",
          nombre: "FÍSICA CALOR, ONDAS Y ÓPTICA",
        },
        {
          codExterno: "ICI311",
          codAsignatura: "REC708",
          codTema: "REC708",
          nombre: "FÍSICA ELECTROMAGNETISMO",
        },
        {
          codExterno: "ICI212",
          codAsignatura: "REC698",
          codTema: "REC698",
          nombre: "FÍSICA MECÁNICA",
        },
      ],
    },
    {
      nombre: "Inglés",
      asignaturasSimilares: [
        {
          codExterno: "ICI213",
          codAsignatura: "REC699",
          codTema: "REC699",
          nombre: "INGLÉS I",
        },

        {
          codExterno: "ICI312",
          codAsignatura: "REC709",
          codTema: "REC709",
          nombre: "INGLÉS II",
        },
        {
          codExterno: "ICI321",
          codAsignatura: "REC715",
          codTema: "REC715",
          nombre: "INGLÉS III",
        },
        {
          codExterno: "ICI411",
          codAsignatura: "REC722",
          codTema: "REC722",
          nombre: "INGLÉS IV",
        },
      ],
    },
    {
      nombre: "",
      asignaturasSimilares: [
        {
          codExterno: "ICI224",
          codAsignatura: "REC705",
          codTema: "REC705",
          nombre: "REDES DE COMPUTADORES I",
        },
        {
          codExterno: "ICI317",
          codAsignatura: "REC714",
          codTema: "REC714",
          nombre: "LABORATORIO DE REDES",
        },
        {
          codExterno: "ICI424",
          codAsignatura: "REC733",
          codTema: "REC733",
          nombre: "REDES DE COMPUTADORES II",
        },
        {
          codExterno: "ICI323",
          codAsignatura: "REC717",
          codTema: "REC717",
          nombre: "SISTEMAS OPERATIVOS",
        },
        {
          codExterno: "ICI314",
          codAsignatura: "REC711",
          codTema: "REC711",
          nombre: "ARQUITECTURA DE COMPUTADORES",
        },
        {
          codExterno: "ICI215",
          codAsignatura: "REC701",
          codTema: "",
          nombre: "HARDWARE DIGITAL",
        },
      ],
    },
    {
      nombre: "Matemáticas",
      asignaturasSimilares: [
        {
          codExterno: "ICI225",
          codAsignatura: "REC706",
          codTema: "",
          nombre: "MATEMÁTICAS DISCRETAS",
        },
        {
          codExterno: "ICI412",
          codAsignatura: "REC723",
          codTema: "REC723",
          nombre: "PROBABILIDADES Y ESTADÍSTICAS",
        },
        {
          codExterno: "ICI221",
          codAsignatura: "REC702",
          codTema: "REC702",
          nombre: "CÁLCULO EN VARIAS VARIABLES",
        },
        {
          codExterno: "ICI222",
          codAsignatura: "REC703",
          codTema: "REC703",
          nombre: "ECUACIONES DIFERENCIALES",
        },
        {
          codExterno: "ICI211",
          codAsignatura: "REC697",
          codTema: "REC697",
          nombre: "CÁLCULO INTEGRAL",
        },
        {
          codExterno: "ICI121",
          codAsignatura: "REC692",
          codTema: "REC692",
          nombre: "CÁLCULO DIFERENCIAL",
        },
        {
          codExterno: "ICI122",
          codAsignatura: "REC693",
          codTema: "REC693",
          nombre: "ÁLGEBRA LINEAL",
        },
        {
          codExterno: "ICI111",
          codAsignatura: "REC686",
          codTema: "REC686",
          nombre: "FUNDAMENTOS DE MATEMÁTICAS",
        },
        {
          codExterno: "ICI112",
          codAsignatura: "REC687",
          codTema: "REC687",
          nombre: "ÁLGEBRA",
        },
      ],
    },
    {
      nombre: "programacion",
      asignaturasSimilares: [
        {
          codExterno: "ICI322",
          codAsignatura: "REC716",
          codTema: "REC716",
          nombre: "ANÁLISIS Y DISEÑO DE ALGORITMOS",
        },
        {
          codExterno: "ICI125",
          codAsignatura: "REC696",
          codTema: "REC696",
          nombre: "PROGRAMACIÓN I",
        },
        {
          codExterno: "ICI214",
          codAsignatura: "REC700",
          codTema: "REC700",
          nombre: "PROGRAMACIÓN II",
        },
        {
          codExterno: "ICI116",
          codAsignatura: "REC691",
          codTema: "REC691",
          nombre: "FUNDAMENTOS DE PROGRAMACIÓN",
        },

        {
          codExterno: "ICI313",
          codAsignatura: "REC710",
          codTema: "REC710",
          nombre: "ESTRUCTURAS DE DATOS",
        },
        {
          codExterno: "ICI316",
          codAsignatura: "REC713",
          codTema: "REC713",
          nombre: "FUNDAMENTOS DE INGENIERÍA DE SW",
        },
      ],
    },
    {
      nombre: "programacion",
      asignaturasSimilares: [
        {
          codExterno: "ICI515",
          codAsignatura: "REC741",
          codTema: "REC741",
          nombre: "SIMULACIÓN",
        },

        {
          codExterno: "ICI514",
          codAsignatura: "REC740",
          codTema: "REC740",
          nombre: "OPTIMIZACIÓN COMPUTACIONAL",
        },
      ],
    },
    {
      nombre: "programacion",
      asignaturasSimilares: [
        {
          codExterno: "ICI326",
          codAsignatura: "REC720",
          codTema: "REC720",
          nombre: "INTERACCIÓN PERSONA COMPUTADOR",
        },
        {
          codExterno: "ICI413",
          codAsignatura: "REC724",
          codTema: "REC724",
          nombre: "LENGUAJES Y AUTÓMATAS",
        },
        {
          codExterno: "ICI415",
          codAsignatura: "REC726",
          codTema: "REC726",
          nombre: "SISTEMAS DE INFORMACIÓN",
        },
        {
          codExterno: "ICI423",
          codAsignatura: "REC732",
          codTema: "REC732",
          nombre: "PRUEBAS DE SISTEMAS",
        },
        {
          codExterno: "ICI425",
          codAsignatura: "REC734",
          codTema: "REC734",
          nombre: "LENGUAJES DE PROGRAMACIÓN",
        },
        {
          codExterno: "ICI516",
          codAsignatura: "REC742",
          codTema: "REC742",
          nombre: "SEGURIDAD DE SISTEMAS",
        },
      ],
    },
  ];
};
