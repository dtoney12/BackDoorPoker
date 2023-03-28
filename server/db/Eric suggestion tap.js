  // return Promise.resolve(getConn())
  //   .tap(conn => {
  //     return conn.queryAsync(command, update);
  //   })
  //   .then(conn => conn.queryAsync(qry.selectQuery(selections), username))
  //   .then(results => user.update(results[0]))
  //   .then(() => cb1&&cb1())
  //   .then(() => cb2&&cb2())
  //   .catch((error)=> status.SetUpdateError(username))
  //