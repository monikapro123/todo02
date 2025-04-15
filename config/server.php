<?php
include 'database.php';


$api_check = 1;

if (isset($_POST['signup'])) {
    $api_check = 0;

    $firstname = trim($_POST["firstname"]);
    $lastname = trim($_POST["lastname"]);
    $email = trim($_POST["email"]);
    $phoneno = trim($_POST["phoneno"]);
    $password = $_POST["password"];
    $confirmPassword = $_POST["confirmpassword"];

    $returndata = ["success" => false];
    $errorcount = 0;

    // Basic Validation
    if (empty($firstname)) {
        $returndata["firstname_error"] = "First name is required.";
        $errorcount++;
    }
    if (empty($lastname)) {
        $returndata["lastname_error"] = "Last name is required.";
        $errorcount++;
    }
    if (empty($email)) {
        $returndata["email_error"] = "Email is required.";
        $errorcount++;
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $returndata["email_error"] = "Invalid email format.";
    }
    if (empty($phoneno)) {
        $returndata["phoneno_error"] = "Phone number is required.";
        $errorcount++;
    }


    if (empty($password)) {
        $returndata["password_error"] = "Password is required.";
        $errorcount++;
    } elseif (strlen($password) < 6) {
        $returndata["password_error"] = "Password must be at least 6 characters.";
        $errorcount++;
    }
    if (empty($confirmPassword)) {
        $returndata["confirmpassword_error"] = "Confirm password is required.";
        $errorcount++;
    }
    if ($password !== $confirmPassword) {
        $returndata["password_error"] = "Passwords do not match.";
        $errorcount++;
    }






    // Check if email or phone number already exists
    $checkemail = "SELECT id FROM users WHERE email = '$email'";
    $checkphoneno = "SELECT id FROM users WHERE phoneno = '$phoneno'";
    $runemail = mysqli_query($conn, $checkemail);
    $runphoneno = mysqli_query($conn, $checkphoneno);

    if (mysqli_num_rows($runemail) > 0) {
        $returndata["email_error"] = "Email already exists.";
        $errorcount++;
    }
    if (mysqli_num_rows($runphoneno) > 0) {
        $returndata["phoneno_error"] = "Phone number already exists.";
        $errorcount++;
    }

    if ($errorcount == 0) {

        // Insert new user
        $sql = "INSERT INTO users (firstname, lastname, email, phoneno, password) VALUES ('$firstname',' $lastname', '$email', '$phoneno', '$password')";
        $query = mysqli_query($conn, $sql);


        if ($query) {
            $_SESSION["loginid"] = $conn->insert_id;

            $returndata["success"] = true;
            $returndata["msg"] = "Data inserted successfully.";
        } else {
            $returndata["msg"] = "Data insertion failed.";
        }


    }
    echo json_encode($returndata, true);
}


if (isset($_POST['signin'])) {
    $api_check = 0;
    $email = $_POST['email'];
    $password = $_POST['password'];
    $returndata['success'] = false;
    $errorcount = 0;
    if (empty($email)) {
        $returndata['email_error'] = "Email is required.";
        $errorcount++;
    }
    if (empty($password)) {
        $returndata['password_error'] = "Password is required.";
        $errorcount++;
    }
    if ($errorcount == 0) {
        $query = "select * from users where email='$email'";
        $run = mysqli_query($conn, $query);
        if (mysqli_num_rows($run) > 0) {
            $data = mysqli_fetch_assoc($run);
            if ($email != $data['email']) {
                $returndata['email_error'] = "Email does not exist";
            }
            if ($data['password'] == $password) {
                $returndata['success'] = true;
                $_SESSION['loginid'] = $data['id'];

                $_SESSION['logindata'] = $data;
                $_SESSION['firstname'] = $data['firstname'];
                $_SESSION['lastname'] = $data['lastname'];
                $returndata['msg'] = "Login successfully";

            } else {
                $returndata['password_error'] = "Password is incorrect";
            }
        }
    }
    echo json_encode($returndata, true);
}



//insert task to database
if (isset($_POST['taskform'])) {

    $api_check = 0;
    $errorcount = 0;
    $returndata['success'] = false;
    $taskinput = trim($_POST['taskinput']);
    $activeListId = $_POST['activeListId'];
    $user_id = $_POST['user_id'];

    $isimp = $_POST["is_imp"];
//     if($activeListId=="Important")
// {

//     $is_imp=1;
// }
    // if(empty($activeListId)){
    //     $returndata['msg']="require active list id";
    //     $errorcount++;
    // }
    if (empty($user_id)) {
        $returndata['msg'] = "User id is required";
        $errorcount++;

    }
    if (empty($taskinput)) {
        $returndata['msg'] = "Task is required.";
        $errorcount++;
    }
    if ($errorcount == 0) {
        $qry = "SELECT id FROM users where id='$user_id' ";
        $runqry = mysqli_query($conn, $qry);

        if (mysqli_num_rows($runqry) < 1) {
            $returndata['msg'] = "user id not found";
            $errorcount++;
        }
    }
    if ($errorcount == 0) {
        $sql = "INSERT INTO tasks (task,list_id, is_imp , created_by,updated_by) VALUES ('$taskinput','$activeListId', $isimp,'$user_id','$user_id')";
        $run = mysqli_query($conn, $sql);

        if ($run) {
            $returndata['success'] = true;
            $returndata['msg'] = "Task added successfully";
        } else {
            $returndata['msg'] = "Failed to add task";
        }


    }

    echo json_encode($returndata, true);
}

if (isset($_POST['getdata'])) {
    $api_check = 0;
    $returndata['success'] = false;
    $where = "";

    if (isset($_POST['id'])) {
        $id = $_POST['id'];
        if ($id == "important") {
            $where = " and is_imp='1' and is_comp='0'";
        } elseif ($id == "completed") {
            $where = " and is_comp='1'";
        } else {
            $where = " and list_id='$id'";
        }
    }
    $sql = "select * from tasks where created_by='" . $_SESSION['loginid'] . "' $where order by id desc ";
    $result = mysqli_query($conn, $sql);
    $data = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
        $returndata['success'] = true;
        $returndata['tasklist'] = $data;
        $returndata['msg'] = "data is fetched";
    } else {
        $returndata['msg'] = "data fetched failed";
    }
    echo json_encode($returndata, true);

}

// new list
if (isset($_POST['addList'])) {
    $api_check = 0;
    $errorcount = 0;
    $listname = trim($_POST['listname']);
    $list_no = trim($_POST['listno']);
    $temp_list = trim($_POST['temp_list']);
    $returndata['success'] = false;
    if (empty($listname)) {
        $errorcount++;
        $returndata['msg'] = "List name is required";
    }
    if (empty($list_no)) {
        $errorcount++;
        $returndata['msg'] = "List number is required";
    }
    if (empty($temp_list)) {
        $errorcount++;
        $returndata['msg'] = "Temp list is required";
    }
    if ($errorcount == 0) {
        $sql = "INSERT INTO lists (list_name,temp_list,list_no) VALUES ('$listname','$temp_list','$list_no')";
        $run = mysqli_query($conn, $sql);
        if ($run) {
            $qry = "SELECT id,newlist,list_no ,temp_list FROM lists where id=$conn->insert_id";
            $runqry = mysqli_query($conn, $qry);
            if ($runqry) {
                $data = mysqli_fetch_assoc($runqry);
                $row[] = $data;
                // print_r($data);
                // die;
                $returndata['data'] = $row;
                $returndata['msg'] = "data is inserted";
                $returndata['success'] = true;
            }

        } else {
            $returndata['msg'] = "data fetched failed";
        }
    }
    echo json_encode($returndata, true);
}

//fetch new list
if (isset($_POST['getnewlist'])) {
    $api_check = 0;
    $returndata['success'] = false;
    $sql = "select id,list_name from lists  where is_default='0'";
    $result = mysqli_query($conn, $sql);
    $data = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
        $returndata['success'] = true;
        $returndata['data'] = $data;

        $returndata['msg'] = "data is fetched";
    } else {
        $returndata['msg'] = "data fetched failed";
    }
    echo json_encode($returndata, true);
}


if (isset($_POST['deletetask'])) {
    $api_check = 0;
    $id = $_POST["id"];
    $sql = "DELETE FROM tasks where id='$id'";
    $run = (mysqli_query($conn, $sql));
    if ($run) {
        $returndata['success'] = true;
    } else {
        $returndata['success'] = false;
    }
    echo json_encode($returndata, true);
}

if (isset($_POST['getdefaultlist'])) {
    $api_check = 0;
    $returndata['success'] = false;
    $sql = "select id,list_name from lists  where is_default='1'";
    $result = mysqli_query($conn, $sql);
    $data = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
        $returndata['success'] = true;
        $returndata['listData'] = $data;
        $returndata['msg'] = "data is fetched";
    } else {
        $returndata['msg'] = "data fetched failed";
    }
    echo json_encode($returndata, true);
}
if (isset($_POST["updateImp"])) {
    $api_check = 0;
    $returndata['success'] = false;
    $id = $_POST["id"];
    $imp = $_POST["imp"] ?? '';
    if ($imp == 0) {
        $is_imp = 1;
    } else {
        $is_imp = 0;
    }
    $sql = "UPDATE tasks SET is_imp='$is_imp' WHERE id='$id'";
    $run = (mysqli_query($conn, $sql));
    if ($run) {
        $returndata['success'] = true;
        $returndata['msg'] = "data is updated";
    } else {
        $returndata['success'] = true;
        $returndata['msg'] = "data updated failed";
    }
    echo json_encode($returndata, true);
}
if (isset($_POST["updateComp"])) {
    $api_check = 0;
    $returndata['success'] = false;
    $id = $_POST["id"];
    $comp = $_POST["comp"];
    if ($comp == 0) {
        $is_comp = 1;
    } else {
        $is_comp = 0;
    }
    $sql = "UPDATE tasks SET is_comp='$is_comp' WHERE id='$id'";
    $run = (mysqli_query($conn, $sql));
    if ($run) {
    
        $returndata['success'] = true;
        $returndata['msg'] = "data is updated";
    } else {
        $returndata['success'] = true;
        $returndata['msg'] = "data updated failed";
    }
    echo json_encode($returndata, true);
}

if(isset($_POST['countTasks'])){
    $api_check = 0;
    $returndata['success'] = false;
    $sql = "select count(*) as total from tasks where is_comp='1'";
    $result = mysqli_query($conn, $sql);
    $sql1="select count(*) as countImportant from tasks where is_imp='1'";
    $result1 = mysqli_query($conn, $sql1);
    $sql2="select count(*) as myday from tasks where list_id='myday' and is_comp='0'";
    $result2 = mysqli_query($conn, $sql2);
    if($result2){
        $row2=$result2->fetch_assoc();
        $returndata['myday']=$row2['myday'];
        $returndata['success'] = true;
    }else{
        $returndata['msg'] = "data fetched failed";
    }
    if($result1){
        $row1=$result1->fetch_assoc();
        $returndata['countImportant']=$row1['countImportant'];
        $returndata['success'] = true;
    }else{
        $returndata['msg'] = "data fetched failed";
    }
    if ($result) {
        $row = $result->fetch_assoc();
        $returndata['success'] = true;
        $returndata['count'] = $row['total'];
        $returndata['msg'] = "data is fetched";
    } else {
        $returndata['msg'] = "data fetched failed";
    }
    echo json_encode($returndata, true);
}

if ($api_check) {

    $returndata["msg"] = "invalid api";
    echo json_encode($returndata, true);
}
?>