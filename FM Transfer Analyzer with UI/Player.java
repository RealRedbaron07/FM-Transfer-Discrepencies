public class Player {
    private String name;
    private int age;
    private String position;
    private int currentAbility;
    private int potentialAbility;
    private int contractYears;
    private int reputation;
    
    public Player() {}
    
    public Player(String name, int age, String position, int currentAbility, 
                  int potentialAbility, int contractYears, int reputation) {
        this.name = name;
        this.age = age;
        this.position = position;
        this.currentAbility = currentAbility;
        this.potentialAbility = potentialAbility;
        this.contractYears = contractYears;
        this.reputation = reputation;
    }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public int getCurrentAbility() { return currentAbility; }
    public void setCurrentAbility(int currentAbility) { this.currentAbility = currentAbility; }
    public int getPotentialAbility() { return potentialAbility; }
    public void setPotentialAbility(int potentialAbility) { this.potentialAbility = potentialAbility; }
    public int getContractYears() { return contractYears; }
    public void setContractYears(int contractYears) { this.contractYears = contractYears; }
    public int getReputation() { return reputation; }
    public void setReputation(int reputation) { this.reputation = reputation; }
}