module.exports = {
    tableName : 'hightable_reports_table',
    tableAlias : 'reports_table',
    attributes : {
        table_id : {type : 'number' },
        creator_id : {type : 'number' },
        user_id : {type : 'number' },
        status : {type : 'number' },
        status_glossary : {type : 'string' },
        table_complaint : {type : 'string' },
    }
}