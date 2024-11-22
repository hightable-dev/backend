module.exports = {
    tableName : 'hightable_reports_host',
    tableAlias : 'reports_host',
    attributes : {
        table_id : {type : 'number' },
        creator_id : {type : 'number' },
        user_id : {type : 'number' },
        status : {type : 'number' },
        status_glossary : {type : 'string' },
        host_complaint : {type : 'string' },
    }
}