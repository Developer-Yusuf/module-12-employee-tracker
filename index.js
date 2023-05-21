// npm packages set as variables
const inquirer = require("inquirer");
// const figlet = require("figlet");
const chalk = require("chalk");
// const cTable = require("console.table");

const {connection} = require('./config/connection');

// function that runs upon starting the file
connection.connect((err) => {
  if (err) throw err;
  console.log('====================================================================================');
  console.log('Welcome to Employee Tracker');
  console.log('------------------------------------------------------');
  // calls the initialQuery function that asks the user what they would like to do
  initialQuery();
});

// initial question asks user what they would like to do
initialQuery = () => {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "Choose what option to do: (You can use arrows)",
      choices: [
        "View department, roles or employees",
        "Add department, roles or employees",
        "Update employee role",
        "Remove employee",
        "View department budgets",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View department, roles or employees":
          viewTable();
          break;

        case "Add department, roles or employees":
          addValue();
          break;

        case "Update employee role":
          updateRole();
          break;

        case "Remove employee":
            removeEmp();
            break;

        case "View department budgets":
            viewBudget();
            break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

// function to add a department, role and/or employee
addValue = () => {
  // array variables to store data pulled from database for use in questions
  let listOfDepartments = [];
  let listOfRoles = [];
  let listOfManagers = [];
  // asks user what they would like to add
  inquirer
    .prompt({
      name: "add",
      type: "list",
      message: "Choose one that you want to add:",
      choices: ["Department", "Role", "Employee"],
    })
    .then((val) => {
      // if user selects "Department"
      if (val.add === "Department") {
        inquirer
          .prompt({
            type: "input",
            name: "dept_add",
            message:
              "Choose the department name to add:",
            validate: newDeptInput => {
              if (newDeptInput) {
                return true
              } else {
                console.log("Enter a name for the new department");
                return false
              }
            }
          })
          .then((answer) => {
            console.log(' ');
            console.log(chalk.green.bold(`====================================================================================`));
            console.log(`                     ` + chalk.red.bold(`Department Added:`) + ` ${answer.dept_add}`);
            console.log(chalk.green.bold(`====================================================================================`));
            console.log(' ');
            connection.query("INSERT INTO Departments SET ?", {name: answer.dept_add}, (err, res) => {
                if (err) throw err;
                initialQuery();
              }
            );
          });


        // if user selects "Role"
      } else if (val.add === "Role") {
        connection.query(`SELECT * FROM departments`, (err, res) => {
          if (err) throw err;
          listOfDepartments = res.map(dept => (
            {
              name: dept.name,
              value: dept.dept_id
            }
          ))
          inquirer
          .prompt([
            {
              type: "input",
              name: "role_add",
              message: "Enter the name for the role you want to add:",
              validate: newRoleInput => {
                if (newRoleInput) {
                  return true
                } else {
                  console.log("Enter a name for the new role");
                  return false
                }
              }
            },
            {
              type: "number",
              name: "salary",
              message: "Enter the salary for the role you are adding:",
              default: 10000
            },
            {
              type: "list",
              name: "deptId",
              message: "Enter the department for the role you are adding:",
              choices: listOfDepartments
            }
          ])
          .then((answer) => {
            console.log(' ');
            console.log(chalk.green.bold(`====================================================================================`));
            console.log(`                     ` + chalk.red.bold(`Role Added:`) + ` ${answer.role_add} with a salary of ${answer.salary}`);
            console.log(chalk.green.bold(`====================================================================================`));
            console.log(' ');
            connection.query("INSERT INTO Roles SET ?",
              {
                title: answer.role_add,
                salary: answer.salary,
                dept_id: answer.deptId,
              },
              (err, res) => {
                if (err) throw err;
                initialQuery();
              }
            );
          });
        })


      // if user selects "Employee"
      } else if (val.add === "Employee") {

        connection.query(`SELECT * FROM roles`, (err,res) => {
          if (err) throw err;
          listOfRoles = res.map(role => (
            {
              name: role.title,
              value: role.role_id
            }
          ));
          
          
          inquirer
            .prompt([
              
              {
                type: "input",
                name: "empAddFirstName",
                message:
                  "Enter the first name of emplyee you want to add:",
                validate: firstNameInput => {
                  if (firstNameInput) {
                    return true
                  } else {
                    console.log ("Please enter a first name");
                    return false
                  }
                }
              },
              {
                type: "input",
                name: "empAddLastName",
                message:
                  "Enter the last name of the employee you want to add?",
              },
              {
                type: "list",
                name: "roleId",
                message: "Enter the role of the employee you are adding:",
                choices: listOfRoles
              },
              {
                type: "number",
                name: "empAddMgrId",
                message:
                  "Enter the manager ID of the employee you are adding:",
                default: 1,
              },
            ])
            .then((answer) => {
              console.log(' ');
              console.log(chalk.green.bold(`====================================================================================`));
              console.log(`                     ` + chalk.red.bold(`Employee Added:`) + ` ${answer.empAddFirstName} ${answer.empAddLastName}`);
              console.log(chalk.green.bold(`====================================================================================`));
              console.log(' ');
              connection.query("INSERT INTO Employees SET ?",
                {
                  last_name: answer.empAddLastName,
                  first_name: answer.empAddFirstName,
                  role_id: answer.roleId,
                  manager_id: answer.empAddMgrId,
                },
                (err, res) => {
                  if (err) throw err;
                  initialQuery();
                }
              );
            });
          })

      }
    });
}

// function to view tables of departments, roles and/or employees
viewTable = () => {
  inquirer
    .prompt({
      name: "view_table",
      type: "list",
      message: "Choose a table to view:",
      choices: ["Departments", "Roles", "Employees"],
    })
    .then((val) => {
      if (val.view_table === "Departments") {
        connection.query(`SELECT dept_id AS Department_ID, departments.name AS Department_Name FROM departments`, (err, res) => {
          if (err) throw err;
          console.log(' ');
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(`                              ` + chalk.red.bold(`All Departments:`));
          console.table(res);
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(' ');
          initialQuery();
        });
      } else if (val.view_table === "Roles") {
        const query = `SELECT roles.role_id AS Role_ID, roles.title AS Title, CONCAT('$', FORMAT (salary, 0)) AS Salary, departments.name AS Department 
        FROM roles 
        INNER JOIN departments ON roles.dept_id = departments.dept_id 
        ORDER BY roles.role_id ASC`
        connection.query(query, (err, res) => {
          if (err) throw err;
          console.log(' ');
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(`                              ` + chalk.red.bold(`All Roles:`));
          console.table(res);
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(' ');
          initialQuery();
        });
      } else if (val.view_table === "Employees") {
          const query = `SELECT emp_id AS Employee_ID, first_name AS First_Name, last_name AS Last_Name, title AS Title, CONCAT('$', FORMAT (salary, 0)) AS Salary, departments.name AS Department 
          FROM employees 
          INNER JOIN roles ON employees.role_Id = roles.role_id 
          INNER JOIN departments ON roles.dept_id = departments.dept_id 
          ORDER BY last_name ASC`
        connection.query(query, (err, res) => {
          if (err) throw err;
          console.log(' ');
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(`                              ` + chalk.red.bold(`All Employees:`));
          console.table(res);
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(' ');
          initialQuery();
        });
      }
    });
}

// function to update the role of a single employee
updateRole = () => {

  let listOfEmployees = [];
  let listOfRoles = [];
  let employeeLastName = null;
  
  // asks the user for the last name of the employee they would like to update
  inquirer
    .prompt([
      {
        name: "empLastName",
        type: "input",
        message:
          "Enter the last name of the employee you want to update:",
      }
    ])
    // then it searches the database for employees with that last name and puts them into an array
    .then((answer) => {

      employeeLastName = answer.empLastName;
      // db query to find all employees by user inputted last name
      // then puts part of the response into an array for subsequent inquirer question
      // then displays info to the user in table
      const query = `SELECT emp_id AS Employee_ID, first_name AS First_Name, last_name AS Last_Name, title AS Title, salary AS Salary, departments.name AS Department FROM employees 
      INNER JOIN roles ON employees.role_Id = roles.role_id
      INNER JOIN departments ON roles.dept_id = departments.dept_id 
      WHERE ?`;
      // 
      connection.query(query, { last_name: answer.empLastName }, (err, res) => {
        if (err) throw err;

        console.log(` `)
        console.log(chalk.green.bold(`====================================================================================`));
        console.log(`                              ` + chalk.red.bold(`Employee Information:`));
        console.table(res);
        console.log(chalk.green.bold(`====================================================================================`));
        console.log(` `);

        listOfEmployees = res.map(employee => (
          {
            name: employee.First_Name,
            value: employee.Employee_ID
          }
        ));

        // db query to find all roles and then put them into an array for a subsequent inquirer question
        connection.query("SELECT * FROM roles", (err, res) => {
          if (err) throw err;

          listOfRoles = res.map(role => (
            {
              name: role.title,
              value: role.role_id
            }
          ))

          inquirer.prompt([
            {
              type: "list",
              name: "nameConfirm",
              message: "Select the employee to confirm",
              choices: listOfEmployees
            },
            {
              type: "list",
              name: "roleChoice",
              message: "Select a new role for the employee",
              choices: listOfRoles
            }
          ])
          .then((answers) => {

            const query = `UPDATE employees SET role_id = ${answers.roleChoice} WHERE emp_id = ${answers.nameConfirm}`;
            connection.query(query, (err, res) => {
                if (err) throw err;
            });
          })
            .then(() => {
              const query = `SELECT emp_id AS Employee_ID, first_name AS First_Name, last_name AS Last_Name, title AS Title, salary AS Salary, departments.name AS Department FROM employees 
                INNER JOIN roles ON employees.role_Id = roles.role_id
                INNER JOIN departments ON roles.dept_id = departments.dept_id 
                WHERE ?`;
              connection.query(query, {last_name: employeeLastName }, (err,res) => {
                if (err) throw err;
                console.log(` `);
                console.log(chalk.green.bold(`====================================================================================`));
                console.log(`                              ` + chalk.red.bold(`Updated Employee Information:`));
                console.table(res);
                console.log(chalk.green.bold(`====================================================================================`));
                console.log(` `);
                initialQuery();
              })
            });
        });
      });        
    });
    
}


// function to remove an employee from the database
removeEmp = () => {

    inquirer
    .prompt([
      {
        name: "empToRemove",
        type: "input",
        message:
          "Enter the last name of the employee you want like to remove:",
      },
    ])
    .then((answer) => {
      const query = `SELECT emp_id AS Employee_ID, first_name AS First_Name, last_name AS Last_Name, title AS Title, salary AS Salary, departments.name AS Department FROM employees 
      INNER JOIN roles ON employees.role_Id = roles.role_id
      INNER JOIN departments ON roles.dept_id = departments.dept_id 
      WHERE ?`;
      connection.query(query, { last_name: answer.empToRemove }, (err, res) => {
        if (err) throw err;
        if (res.length === 0) {
          console.log (chalk.red.inverse("No employee found by that name"));
          initialQuery();
        } else {
          console.log(chalk.green.inverse("Employee found"))
          console.log(` `)
          console.log(chalk.green.bold(`====================================================================================`));
          console.log(`                              ` + chalk.red.bold(`Employee Information:`));
          console.table(res);
          console.log(chalk.green.bold(`====================================================================================`));
          inquirer
            .prompt({
            name: "idConfirm",
            type: "number",
            message: "Enter the employee's ID to confirm choice:",
            })
            .then((answer) => {
              const query = "SELECT * FROM Employees WHERE ?";
              connection.query(query, { emp_id: answer.idConfirm }, (err, res) => {
              if (err) throw err;
              let idToDelete = answer.idConfirm;
              const deleteQuery = `DELETE FROM employees WHERE emp_id = ${idToDelete}`;
              connection.query(deleteQuery, (err,res) => {
                if (err) throw err;
                      
                console.log(chalk.green.bold(`====================================================================================`));
                console.log(`                  ` + chalk.red.bold(`Employee with ID #${idToDelete} has been removed.`));
                console.log(chalk.green.bold(`====================================================================================`));
                
                initialQuery();
              })
            }
            );
            });
        }
    }
    );
    });
    
}

// function to view the budgets of each department
viewBudget = () => {
  const query = `SELECT departments.dept_id AS Dept_ID, departments.name AS Department_Name, CONCAT('$', FORMAT(SUM(salary),0)) AS Budget 
  FROM roles 
  INNER JOIN employees USING (role_id)
  INNER JOIN departments ON roles.dept_id = departments.dept_id 
  GROUP BY roles.dept_id;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log(` `);
    console.log(chalk.green.bold(`====================================================================================`));
    console.log(`                              ` + chalk.red.bold(`Department Budgets:`));
    console.table(res);
    console.log(chalk.green.bold(`====================================================================================`));
    console.log(` `);
    initialQuery();
  })
}

// End of line