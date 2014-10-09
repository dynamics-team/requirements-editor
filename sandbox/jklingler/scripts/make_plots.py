__author__ = 'J'

import math
import matplotlib.pyplot as plt

def plot_squashing_functions():

    functions = []

    x = [i*0.002 for i in range(-250, 750)]

    exponential = [0 for i in x[:251]]
    [exponential.append((math.exp(i) - 1.0)/(math.exp(1) - 1.0)) for i in x[251:751]]
    [exponential.append(1) for i in x[751:]]

    log = [0 for i in x[:251]]
    [log.append((math.log(i + 1.0))/(math.log(2))) for i in x[251:751]]
    [log.append(1) for i in x[751:]]

    plt.figure()
    plt.ylim([-0.1, 1.1])
    plt.xlim([-0.5, 1.5])
    plt.plot(x, exponential, label='exp')
    plt.legend(loc=0)
    plt.savefig('exp.svg')
    plt.close()

    plt.figure()
    plt.ylim([-0.1, 1.1])
    plt.xlim([-0.5, 1.5])
    plt.plot(x, log, label='log')
    plt.legend(loc=0)
    plt.savefig('log.svg')
    plt.close()

if __name__ == "__main__":
    plot_squashing_functions()