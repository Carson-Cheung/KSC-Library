let data: any; //Don't delete this line. All your data is here. It does take a few seconds for it to load the data because it's so large.
/**
 * @const
 */
/** @const {HTMLTableElement} TABLE - The main table element on the page */
const TABLE = document.getElementById("table") as HTMLTableElement;

/** @const {HTMLTableSectionElement} TABLE_BODY - The body of the table */
const TABLE_BODY = document.getElementById(
  "table-body"
) as HTMLTableSectionElement;

/**
 * @const {HTMLSelectElement} CATEGORIES - The select element for categories
 * used to see which category user is searching for
 */
const CATEGORIES = document.getElementById("categories") as HTMLSelectElement;

/** @const {HTMLDivElement} ELEMENTS - The div element for table navigation */
const ELEMENTS = document.getElementById("table-navigator") as HTMLDivElement;

/** @const {HTMLDivElement} PARENT_CONTAINER - The parent container div */
const PARENT_CONTAINER = document.getElementById(
  "parent-container"
) as HTMLDivElement;

/** @const {HTMLParagraphElement} SEARCH_TIME - The paragraph element for displaying search time */
const SEARCH_TIME = document.getElementById("time") as HTMLParagraphElement;

/** @const {HTMLParagraphElement} P_LOAD_TIME - The paragraph element for displaying load time */
const P_LOAD_TIME = document.getElementById(
  "load-time"
) as HTMLParagraphElement;

/** @const {HTMLParagraphElement} P_BONUS_RESULT - The paragraph element for displaying bonus result */
const P_BONUS_RESULT = document.getElementById(
  "bonus-result"
) as HTMLParagraphElement;

/** @const {HTMLDivElement} DIV_PAGE_NUMBER - The div element for displaying page number */
const DIV_PAGE_NUMBER = document.getElementById(
  "page-number"
) as HTMLDivElement;

/** @const {HTMLDivElement} DIV_NAVBAR - The div element for the navbar wrapper */
const DIV_NAVBAR = document.getElementById("navbar-wrapper") as HTMLDivElement;

/** @const {string[]} BACKGROUNDS - An array of backgrounds for the backgrounds images */
const BACKGROUNDS: string[] = [
  "url('./backgrounds/cat.jpg')",
  "url('./backgrounds/dog.jpg')",
  "url('./backgrounds/road.jpg')",
  "url('./backgrounds/ships.jpg')",
];

/** @const {HTMLButtonElement} BACK_BUTTON - The button element for going back a page on the table */
const BACK_BUTTON = document.getElementById("back-button") as HTMLButtonElement;

/** @const {HTMLButtonElement} FORWARD_BUTTON - The button element for going forward a page forward on the table */
const FORWARD_BUTTON = document.getElementById(
  "forward-button"
) as HTMLButtonElement;

//used for correct time display
//see function updateTime
let firstLoad: boolean = false;
let ascending: boolean = true;

let fNameArr: any[][] = [[]];
let lNameArr: any[][] = [[]];
let bookNameArr: any[][] = [[]];
let genderArr: any[][] = [[]];
let guidArr: any[][] = [[]];
let genderArrRanges: any[][] = [[]];
let dataGenderRanges: any[][][] = [[[]]];
let otherPageInfo: number[] = [];
let searchedIndexes: number[] = [];
let genderMap = new Map();

//used for back and forward buttons, checks and stores the number/ current pages.
let page: number = 0;
let currentPage = 0;
let numberOfPages = 0;

// Disable the Back buttton at the start
BACK_BUTTON.disabled = true;

//used for performance.now
let t0: number = 0;
let t1: number = 0;

let holder: any[][][];
let index: number = 0;
const FIRSTNAME: number = 0;
const LASTNAME: number = 1;
const GENDER: number = 2;
const BOOKNAME: number = 3;
const GUID: number = 4;

let guidMap = new Map();

let tier: number = 0;

class SearchNode {
  public cords: string;
  public parent: SearchNode | null;
  public index: number;

  constructor(cords: string, parent: SearchNode | null, index: number) {
    this.cords = cords;
    this.parent = parent;
    this.index = index;
  }
}

/**
 * creates Queue data structure
 * used for BFS
 */
/**
 * A class representing a queue data structure.
 */
class Queue {
  /** @public {SearchNode[]} frontier - The array of nodes in the queue */
  public frontier: SearchNode[] = [];

  /**
   * Checks if the queue is empty.
   * @returns {boolean} True if the queue is empty, false otherwise.
   */
  public empty(): boolean {
    return this.frontier.length === 0;
  }

  /**
   * Adds a node to the queue if it does not already exist.
   * @param {SearchNode} node - The node to add.
   */
  public add(node: SearchNode): void {
    if (!this.contains(node.cords)) {
      this.frontier.push(node);
    }
  }

  /**
   * Checks if a coordinate is in the queue.
   * @param {string} cords - The coordinates to check.
   * @returns {boolean} True if the coordinates are in the queue, false otherwise.
   */
  public contains(cords: string): boolean {
    for (let node of this.frontier) {
      if (node.cords === cords) {
        return true;
      }
    }

    return false;
  }

  /**
   * Removes and returns the first node from the queue.
   * @returns {SearchNode} The first node from the queue.
   */
  public remove(): SearchNode {
    return this.frontier.shift() as SearchNode;
  }

  /**
   * Returns the size of the queue.
   * @returns {number} The size of the queue.
   */
  public size(): number {
    return this.frontier.length;
  }
}

class BFS {
  /** @public {number[][]} maze - The 2D maze that we will be traversing to find the best path*/
  public maze: number[][];
  /** @public {number} start - the starting index of the maze */
  public start: number;
  /** @public {number} goal - the goal index of the maze */
  public goal: number;
  /** @public {number} height - height of the maze */
  public height: number;
  /** @public {number} width - width of the maze */
  public width: number;
  /** @public {Queue} frontier - Queue to hold the nodes */
  public frontier: Queue = new Queue();
  /** @public {Set<string>} explored - the explored indexes of the maze */
  public explored: Set<number> = new Set();

  /**
   * Constructs a new instance of the class.
   * @param {number[][]} maze - The maze represented as a 2D array.
   * @param {number} start - The starting point in the maze in the format row|col.
   * @param {number} goal - The goal point in the maze in the format row|col.
   */
  constructor(maze: number[][], start: number, goal: number) {
    // Assumes all mazes are rectangles. Start and goal are both in the format row|col.
    this.maze = maze;
    this.height = maze.length;
    this.width = maze[0].length;
    this.start = start;
    this.goal = goal;
  }

  public solve(): number[] {
    tier = 0;
    const startingNode: SearchNode = new SearchNode(
      this.start.toString(),
      null,
      this.start
    );

    this.frontier.add(startingNode);

    while (true) {
      //If the frontier is empty, the search is over.
      if (this.frontier.empty()) {
        P_LOAD_TIME.innerText = "No Path Found";
        return;
      } else {
        //Search the first node in the frontier
        let node: SearchNode = this.frontier.remove();
        let cords: string[] = node.cords.split("|");

        //If we've reached the goal, loop through all the nodes to create the path we took.
        if (
          guidMap.get(data.references[Number(cords[0])][Number(cords[1])]) ===
          this.goal
        ) {
          const actions: number[] = [];
          while (node.parent !== null) {
            actions.push(node.index);
            node = node.parent;
          }
          actions.push(startingNode.index);
          reverse(actions);
          return actions;
        }

        //Mark node as explored and add the neighbors.
        // checks if we are at the start
        if (tier === 0) {
          this.explored.add(guidMap.get(data.guid[Number(cords[0])]));
          this.addNeighbors(node, this.start);
        } else {
          this.explored.add(
            guidMap.get(data.references[Number(cords[0])][Number(cords[1])])
          );
          this.addNeighbors(
            node,
            guidMap.get(data.references[Number(cords[0])][Number(cords[1])])
          );
        }
      }
    }
  }
  /**
   *
   * @param {SearchNode} node - The node that we need to add the neighbors from
   * @param {number} index - index of the node
   */
  public addNeighbors(node: SearchNode, index: number) {
    for (let i = 0; i < 10; i++) {
      if (
        !this.frontier.contains(index + "|" + i) &&
        !this.explored.has(guidMap.get(data.references[index][i]))
      ) {
        const child: SearchNode = new SearchNode(
          index + "|" + i,
          node,
          guidMap.get(data.references[index][i])
        );
        this.frontier.add(child);
      }
    }
  }
}

start();

/**
 * This function sets up the code and loads the site
 * It pre-sorts and stores the arrays so searching later is faster
 * O(n^2)
 */
function start(): void {
  console.log("ran");
  data = loadJSON("../DO_NOT_TOUCH/data.json");
  $(".loader-wrapper").fadeOut(1000);
  PARENT_CONTAINER.style.display = "flex";
  DIV_NAVBAR.style.display = "block";
  //random background
  document.body.style.backgroundImage =
    BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  t0 = performance.now();
  for (let i = 0; i < data.firstName.length; i++) {
    // a 2D copy of each categories data, that has the data itself on first index and the index of the data on the second index. stored in lowercase so that our search is not case sensitive
    fNameArr[i] = [data.firstName[i].toLowerCase(), i];
    lNameArr[i] = [data.lastName[i].toLowerCase(), i];
    bookNameArr[i] = [data.bookName[i].toLowerCase(), i];
    genderArr[i] = [data.gender[i].toLowerCase(), i];
    guidArr[i] = [data.guid[i].toLowerCase(), i];
    // a map of the guids, with the guid as the key and the index as the value
    guidMap.set(data.guid[i].toLowerCase(), i);
  }
  // sorting all the 2D copy arrays alphabetically
  mergeSort2D(fNameArr);
  mergeSort2D(lNameArr);
  mergeSort2D(genderArr);
  mergeSort2D(bookNameArr);
  mergeSort2D(guidArr);

  /**
   * seperates the genderArr into a 3D array where
   * the first dimension is the different genders
   * second dimension is all the individuals of that gender
   * third dimension is the last name and the data index of that person
   */
  let start = 0;
  let indexForGenderRange = 0;
  for (let i = 0; i < genderArr.length; i++) {
    if (i !== 0) {
      if (genderArr[i][0] !== genderArr[i - 1][0]) {
        mergeSort2D(dataGenderRanges[indexForGenderRange]);
        indexForGenderRange++;
        start = 0;
        genderArrRanges[indexForGenderRange] = [];
        dataGenderRanges[indexForGenderRange] = [];
      }
    }
    dataGenderRanges[indexForGenderRange][start] = [
      data.lastName[genderArr[i][1]],
      genderArr[i][1],
    ];
    start++;
  }
  start = 0;
  indexForGenderRange = 0;

  for (let i = 0; i < genderArr.length; i++) {
    if (i !== 0) {
      if (genderArr[i][0] !== genderArr[i - 1][0]) {
        indexForGenderRange++;
        genderArrRanges[indexForGenderRange] = [];
        start = 0;
      }
    }
    genderArrRanges[indexForGenderRange][start] =
      dataGenderRanges[indexForGenderRange][start][1];
    start++;
  }

  // 3D array that stores everything in sorted order
  holder = [fNameArr, lNameArr, genderArr, bookNameArr, guidArr];

  t1 = performance.now();

  //checks whether user is on table site
  if (window.location.href.includes("table.html")) {
    for (let i = 0; i < 100000; i++) {
      searchedIndexes[i] = i;
    }
    t1 = performance.now();
    firstLoad = true;
    populateTable(searchedIndexes);
  }

  P_LOAD_TIME.innerText = "Load Time: " + (t1 - t0).toFixed(2);
}

/**
 * Used for bonus
 * finds shortest reference path between authors
 * @param {string} start - starting author UID
 * @param {string} finish - ending author UID
 */

function maze(start: string, finish: string): void {
  let maze: BFS = new BFS(
    data.references,
    guidMap.get(start),
    guidMap.get(finish)
  );
  t0 = performance.now();
  // checks to see if the both start and end guids are true guids
  if (!isNaN(guidMap.get(start)) && !isNaN(guidMap.get(finish))) {
    let ans = maze.solve();
    t1 = performance.now();
    P_BONUS_RESULT.innerText =
      ans.length -
      1 +
      " is the least number of jumps to reach the goal" +
      "\n" +
      (t1 - t0).toFixed(2) +
      "ms";
    for (let i = 0; i < ans.length; i++) {
      P_BONUS_RESULT.innerText +=
        "\n" + data.firstName[ans[i]] + " " + data.lastName[ans[i]];
    }
    console.log(maze.explored);
  } else {
    P_BONUS_RESULT.innerText = "Invalid Input";
  }
}

/**
 * This function navigates to the previous page.
 * It disables the BACK_BUTTON when the current page is the first page.
 * It disables the FORWARD_BUTTON when the current page is the last page.
 * O(1)
 */
function goBack(): void {
  FORWARD_BUTTON.disabled = false;
  if (ascending !== false) {
    if (currentPage > 0) {
      currentPage--;
      populateTable(searchedIndexes, currentPage);
    } else {
      BACK_BUTTON.disabled = true;
    }
  } else {
    if (currentPage < numberOfPages - 1) {
      currentPage++;
      populateTable(searchedIndexes, currentPage);
    } else {
      BACK_BUTTON.disabled = true;
    }
  }
}
/**
 * This function navigates to the next page.
 * It disables the BACK_BUTTON when the current page is the first page.
 * It disables the FORWARD_BUTTON when the current page is the last page.
 * O(1)
 */
function goForward(): void {
  BACK_BUTTON.disabled = false;
  if (ascending !== false) {
    if (currentPage < numberOfPages - 1) {
      currentPage++;
      populateTable(searchedIndexes, currentPage);
    } else {
      FORWARD_BUTTON.disabled = true;
    }
  } else {
    if (currentPage > 0) {
      currentPage--;
      populateTable(searchedIndexes, currentPage);
    } else {
      FORWARD_BUTTON.disabled = true;
    }
  }
}

/**
 * This function populates the table with data.
 * It also updates the time.
 * @param {number[]} array - The array of data to populate the table with.
 * @param {number} pageNumber - The page number to display. Default is 0.
 * O(1) since we know its always going to be 5 or less
 */
function populateTable(array: number[], pageNumber: number = 0): void {
  numberOfPages = Math.floor(array.length / 5 + (array.length % 5 > 0 ? 1 : 0));

  //clears table by removing all rows
  for (let i = TABLE_BODY.rows.length - 1; i >= 0; i--) {
    TABLE_BODY.deleteRow(i);
  }

  /**
   * if there are results
   * add them to table
   */
  if (array.length > 0) {
    ELEMENTS.style.display = "block";
    let condition: number = 0;
    if (pageNumber === numberOfPages - 1 && array.length % 5 != 0) {
      condition = 5 - (array.length % 5);
    }

    if (ascending !== false) {
      DIV_PAGE_NUMBER.innerHTML = (pageNumber + 1).toString();
    } else {
      DIV_PAGE_NUMBER.innerHTML = (numberOfPages - pageNumber).toString();
    }

    let iterator = 0;
    //displays all the results
    for (let i = pageNumber * 5; i < 5 * (pageNumber + 1) - condition; i++) {
      let row = TABLE_BODY.insertRow(iterator);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
      let cell4 = row.insertCell(3);
      let cell5 = row.insertCell(4);
      let cell6 = row.insertCell(5);

      cell1.innerHTML = data.firstName[array[i]];
      cell2.innerHTML = data.lastName[array[i]];
      cell3.innerHTML = data.gender[array[i]];
      cell4.innerHTML = data.bookName[array[i]];
      cell5.innerHTML = data.guid[array[i]];

      //shows references only if user clicks on box
      cell6.onclick = function () {
        displayReferences(cell6, array[i]);
      };
      cell6.innerText = "Click To Expand";

      iterator++;
    }
  } else {
    //removes the table and forward/backward buttons if there are no results
    ELEMENTS.style.display = "none";
  }

  updateTime(t1 - t0, array.length);
}

/**
 * This function performs a search on the data.
 * It also updates the current page and button states.
 * @param {string} target - The target value to search for.
 * @returns {void | null} - Returns null if the target is found, otherwise returns void.
 * Worst: O(logn) Best: O(1)
 */
function search(target: string): void | null {
  currentPage = 0;
  BACK_BUTTON.disabled = true;
  FORWARD_BUTTON.disabled = false;
  //checks which catagory is being searched
  checkIndex();
  t0 = performance.now();

  //binary search
  let L: number = 0;
  let R: number = data[CATEGORIES.value].length - 1;
  while (L <= R) {
    let M: number = Math.floor((L + R) / 2);
    if (holder[index][M][0] < target) {
      L = M + 1;
    } else if (holder[index][M][0] > target) {
      holder[index][M][0] > target;
      R = M - 1;
    } else {
      findDupes(M, target);

      // Check to enable or disable the "Go Forward" button after findDupes is called
      if (searchedIndexes.length > 5) {
        // If there are more than 5 results, enable the "Go Forward" button
        FORWARD_BUTTON.disabled = false;
      } else {
        // Otherwise, disable the "Go Forward" button
        FORWARD_BUTTON.disabled = true;
      }

      return null;
    }
  }

  populateTable([]);
}

/**
 * This function finds duplicate values in the data.
 * It also sorts the duplicates. (another function called inside)
 * @param {number} origin - The origin index to start searching for duplicates from.
 * @param {string} target - The target value to find duplicates of.
 * O(n)
 */
function findDupes(origin: number, target: string): void {
  let dupes: number[] = [];
  if (CATEGORIES.value !== "gender") {
    let checker: number = 0;
    let n: number = 0;
    let back: number[] = [];
    let forward: number[] = [];

    //loops through the left and right side of where the first search was found
    while (true) {
      checker = 0;
      //checks right side
      if (
        origin + n + 1 < 100000 &&
        holder[index][origin + n + 1][0] == target
      ) {
        forward[n] = holder[index][origin + n + 1][1];
      } else {
        checker++;
      }
      //checks left side
      if (origin - n > -1 && holder[index][origin - n][0] == target) {
        back[n] = holder[index][origin - n][1];
      } else {
        checker++;
      }
      if (checker == 2) {
        break;
      }
      n++;
    }
    dupes = [...forward, ...back];
  } else {
    // loop through the genders until target is met
    for (let i = 0; i < genderArrRanges.length; i++) {
      if (target === data.gender[dataGenderRanges[i][0][1]].toLowerCase()) {
        // assign all the indexes of the target gender to dupes
        dupes = [...genderArrRanges[i]];
        break;
      }
    }
  }
  sortDupes(dupes);
}

/**
 * Copies the duplicates of the array to be sorted.
 * The actual sorting is done by other function
 * This function is used to sort all duplicates in order based on searched info.
 * If searching for the first name, it sorts by the last name.
 * Everything else is sorted by the first name.
 * @param {number[]} arr - The array to be sorted.
 * Worst: O(n) Best: O(1)
 */
function sortDupes(arr: number[]): void {
  let temp: any[][] = [[]];
  if (CATEGORIES.value !== "gender") {
    //copies array
    if (CATEGORIES.value !== "lastName") {
      for (let i = 0; i < arr.length; i++) {
        temp[i] = [data.lastName[arr[i]], arr[i]];
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        temp[i] = [data.firstName[arr[i]], arr[i]];
      }
    }

    //sends a copy of array to merge sort
    //the actual sorting
    mergeSort2D(temp);
    searchedIndexes = [];
    for (let i = 0; i < temp.length; i++) {
      searchedIndexes[i] = temp[i][1];
    }
  } else {
    //gender is already sorted
    //so just need to display it
    searchedIndexes = [...arr];
  }

  t1 = performance.now();
  populateTable(searchedIndexes);
}

/**
 * Performs a merge sort on a 2D array.
 * This function uses the divide and conquer strategy to sort a 2D array.
 * @param {T[][]} arr - The 2D array to be sorted.
 * @return {T[][]} - The 2D array that has been sorted by its 1st index.
 * O(logn) for this specific section of mergeSort2D
 * O(nlogn) when counting them together
 * This snippet of code is from:
 * https://mike.ma/grade12/unit_1_data_structures_and_algorithms/4._algorithms/4.7._merge_sort
 * It was changed so that it takes in a 2D array and sorts it by its first index
 */

function mergeSort2D<T>(arr: T[][]): T[][] {
  //Base case
  if (arr.length <= 1) {
    return arr;
  }
  //Divide
  let mid: number = Math.floor(arr.length / 2); //It doesn't really matter if it is floor or ceil here.
  let left: T[][] = arr.slice(0, mid); //First half
  let right: T[][] = arr.slice(mid); //Second half

  //Conquer
  left = mergeSort2D(left);
  right = mergeSort2D(right);

  //Combine
  return merge2D(left, right, arr);
}

/**
 * Merges two 2D arrays into one sorted 2D array.
 * This function is a helper function for the mergeSort2D function.
 * @param {T[][]} left - The first 2D array to be merged.
 * @param {T[][]} right - The second 2D array to be merged.
 * @param {T[][]} arr - The original unsorted 2D array.
 * @return {T[][]} - The merged and sorted 2D array.
 * O(n) for this specific section of mergeSort2D
 */
/** 
  * This snippet of code is from:
  * https://mike.ma/grade12/unit_1_data_structures_and_algorithms/4._algorithms/4.7._merge_sort
  * The code was changed so that instead of comparing the values of a 1D array, it 
  * compares the values of the first index of a 2D array

*/
function merge2D<T>(left: T[][], right: T[][], arr: T[][]): T[][] {
  let i = 0;
  let j = 0;

  for (let k = 0; k < arr.length; k++) {
    if (i >= left.length) {
      //If left is empty
      arr[k] = right[j]; //Dump in the values from right
      j++;
    } else if (j >= right.length) {
      //If right is empty
      arr[k] = left[i]; //Dump in the values from left
      i++;
    } else if (left[i][0] < right[j][0]) {
      arr[k] = left[i];
      i++;
    } else {
      arr[k] = right[j];
      j++;
    }
  }
  return arr;
}

/**
 * Displays the time taken to search and return sorted results.
 * This function does not include display time.
 * @param {number} time - The time taken to search and return sorted results./
 * The time it took to perform the search
 * @param {number} results - The number of results found from the search.
 * O(1)
 */

function updateTime(time: number, results: number): void {
  //firstLoad is used to check if it is the first time loading the table site
  //otherwise the search time box displays the load time which is incorrect
  if (results != 0 && firstLoad == false) {
    SEARCH_TIME.innerHTML =
      results + " results in " + time.toFixed(2) + " milliseconds";
  } else if (firstLoad == false) {
    SEARCH_TIME.innerHTML = "no results";
  }
}

/**
 * Reverses the input array in-place.
 *
 * @param {T[]} arr - The array to be reversed.
 * O(n)
 */
function reverse<T>(arr: T[]): void {
  for (let i = 0; i < arr.length / 2; i++) {
    [arr[i], arr[arr.length - i - 1]] = [arr[arr.length - i - 1], arr[i]];
  }
}

/**
 * Sorts table based on category and order
 * @param {string} order - Order of sorting (ascending/descending)
 * O(n)
 */

/**
 * Sorts a table based on the specified order.
 *
 * @param {string} order - The order to sort the table. Can be "ascending" or "descending".
 * O(n)
 */
function sortTable(order: string): void {
  BACK_BUTTON.disabled = true;
  checkIndex();
  currentPage = 0;
  firstLoad = false; //see updateTime function
  t0 = performance.now();
  if (searchedIndexes[0] !== holder[index][0][1]) {
    for (let i = 0; i < holder[index].length; i++) {
      searchedIndexes[i] = holder[index][i][1];
    }
  }
  if (order === "descending") {
    ascending = false;
    currentPage =
      Math.floor(
        searchedIndexes.length / 5 + (searchedIndexes.length % 5 > 0 ? 1 : 0)
      ) - 1;
    t1 = performance.now();
    populateTable(searchedIndexes, currentPage);
  } else {
    ascending = true;
    t1 = performance.now();
    populateTable(searchedIndexes);
  }
}

/**
 * Checks what category user is searching for
 * Changes index variable accordingly
 * O(1)
 */
function checkIndex(): void {
  if (CATEGORIES.value == "firstName") {
    index = FIRSTNAME;
  } else if (CATEGORIES.value == "lastName") {
    index = LASTNAME;
  } else if (CATEGORIES.value == "gender") {
    index = GENDER;
  } else if (CATEGORIES.value == "bookName") {
    index = BOOKNAME;
  } else {
    index = GUID;
  }
}
/**
 * Displays references in a table cell. If the cell is clicked, it expands to show the references.
 *
 * @param {HTMLTableCellElement} cell - The table cell to display the references in.
 * @param {number} index - The index of the references in the data.references array.
 * O(1)
 */
function displayReferences(cell: HTMLTableCellElement, index: number): void {
  if (cell.innerText !== "Click To Expand") {
    cell.innerText = "Click To Expand";
  } else {
    cell.innerText = "";
    for (let j = 0; j < 10; j++) {
      cell.innerText +=
        data.lastName[guidMap.get(data.references[index][j])] +
        ", " +
        data.firstName[guidMap.get(data.references[index][j])] +
        "\n";
    }
  }
}
